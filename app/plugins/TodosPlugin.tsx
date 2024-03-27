import { useEffect } from 'react';
import { LexicalEditor, COMMAND_PRIORITY_EDITOR, BaseSelection, $isTextNode } from 'lexical';
import { mergeRegister } from '@lexical/utils';
import {
  TodoCheckboxStatusNode,
  TodoStatus
} from '@/app/nodes/TodoNode';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { 
  $wrapLIContentsWithTodo,
  $unwrapTodoContents,
  $handleSetTodoStatus,
  $handleSetTodoDoneValue,
  hasTodo,
  TodoDoneTextClass,
  $changeTodoStatus
} from '@/app/lib/todo-helpers';
import { 
  INSERT_TODO_COMMAND,
  INSERT_DOING_TODO_COMMAND,
  INSERT_NOW_TODO_COMMAND,
  INSERT_LATER_TODO_COMMAND,
  REMOVE_TODO_COMMAND,
  SET_TODO_DONE_VALUE_COMMAND,
  SET_TODO_STATUS_COMMAND
} from '@/app/lib/todo-commands';
import { ListItemNode } from '@lexical/list';
import { $isRangeSelection } from 'lexical';
import { $getSelection } from 'lexical';

function getListItemFromSelection(selection: BaseSelection): ListItemNode | null {
  if (
    selection === null ||
    !$isRangeSelection(selection) ||
    !selection.isCollapsed()
  ) {
    return null;
  }
  const node = selection.anchor.getNode().getParent();
  if (node instanceof ListItemNode) {
    return node;
  }
  return null;
}

function todoAddOrChangeCommand(status: TodoStatus, done: boolean) {
  const theSelection = $getSelection();
  if (!theSelection)  return;
  const listItem = getListItemFromSelection(theSelection);
  if (listItem) {
    if (!hasTodo(listItem)) {
      $wrapLIContentsWithTodo(listItem, status, done);
    } else {
      $changeTodoStatus(listItem, status);
    }
  }
}

function extractTodoStatus(input: string): TodoStatus | null {
  const prefixes = Object.values(TodoStatus);
  const regex = new RegExp(`^(${prefixes.join('|')})\\s`);
  const match = input.match(regex);
  return match ? TodoStatus[match[1] as keyof typeof TodoStatus] : null;
}

function registerTodoHandlers(editor: LexicalEditor) {
  return mergeRegister(
    editor.registerCommand(
      INSERT_TODO_COMMAND,
      () => {
        todoAddOrChangeCommand(TodoStatus.TODO, false);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      INSERT_DOING_TODO_COMMAND,
      () => {
        todoAddOrChangeCommand(TodoStatus.DOING, false);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      INSERT_NOW_TODO_COMMAND,
      () => {
        todoAddOrChangeCommand(TodoStatus.NOW, false);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      INSERT_LATER_TODO_COMMAND,
      () => {
        todoAddOrChangeCommand(TodoStatus.LATER, false);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      SET_TODO_STATUS_COMMAND,
      ({ status, todoNodeKey }) => {
        $handleSetTodoStatus(status, todoNodeKey);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      SET_TODO_DONE_VALUE_COMMAND,
      ({ done, todoNodeKey }) => {
        $handleSetTodoDoneValue(editor, done, todoNodeKey);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      REMOVE_TODO_COMMAND,
      () => {
        const theSelection = $getSelection();
        if (!theSelection) {
          return true;
        }
        const listItem = getListItemFromSelection(theSelection);
        if (listItem) {
          $unwrapTodoContents(listItem);
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerNodeTransform(ListItemNode, (node) => {
      // I suppose I've committed worse crimes ...
      // This is really only here to make sure the strikethrough is set correctly when
      // the editor is loaded from a serialized state.
      // Probably this means we should be wrapping all the text in an ElementNode, but 
      // that created a problem with not being able to insert text in the todo if
      // all the text and the TextNode was deleted.
      if (!hasTodo(node)) {
        // if we removed a todo node, remove leftover styles
        for (const child of node.getChildren()) {
          const elem = editor.getElementByKey(child.getKey());
          if (elem && elem.classList.contains(TodoDoneTextClass)) {
            elem.classList.remove(TodoDoneTextClass);
          }
        }
        // this is mostly for deserializing todos from markdown
        // and i'm not even sure if it will work for that
        const status = extractTodoStatus(node.getTextContent());
        if (status) {
          const firstChild = node.getFirstChild();
          if (firstChild) {
            if ($isTextNode(firstChild)) {
              firstChild.setTextContent(firstChild.getTextContent().replace(`${status} `, ''));
            }
            let newStatus = status;
            if (status === TodoStatus.DONE) {
              newStatus = TodoStatus.TODO;
            }
            $wrapLIContentsWithTodo(node, newStatus as TodoStatus, false);
            if (status === TodoStatus.DONE) {
              const todoNode = node.getChildren()[0] as TodoCheckboxStatusNode;
              $handleSetTodoDoneValue(editor, true, todoNode.getKey());
            }
          }
        }
      } else {
        const todoNode = node.getChildren()[0] as TodoCheckboxStatusNode;
        if (todoNode.getDone()) {
          for (const child of node.getChildren()) {
            if ($isTextNode(child)) {
              const elem = editor.getElementByKey(child.getKey());
              if (elem) {
                elem.classList.add(TodoDoneTextClass);
              }
            }
          }
        }
      }
    })
  );
}

export function TodosPlugin(): null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([TodoCheckboxStatusNode])) {
      throw new Error('TodoPlugin: TodoCheckboxStatusNode not registered on editor');
    }
    return registerTodoHandlers(editor);
  }, [editor]);

  return null;
}