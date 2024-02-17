/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Spread } from 'lexical';

import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  SerializedTextNode,
} from 'lexical';

import {$applyNodeReplacement, ElementNode, TextNode, $createTextNode} from 'lexical';

export type SerializedWikilinkNode = SerializedElementNode;

export class WikilinkInternalNode extends TextNode {
  static getType(): string {
    return 'wikilink-internal';
  }

  //markDirty(): void {
  //  console.log("markDirty");
  //  super.markDirty();
  //  this.getParent().markDirty();
  //}

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    if (this.getTextContent().startsWith('[') || this.getTextContent().startsWith(']')) {
      dom.className = 'PlaygroundEditorTheme__wikilinkBracket';
    } else {
      dom.className = 'PlaygroundEditorTheme__wikilinkPageTitle';
    }
    return dom;
  }

  exportJSON(): SerializedTextNode {
    return {
      ...super.exportJSON(),
      type: 'wikilink-internal',
      version: 1
    };
  }

  static importJSON(serializedNode: SerializedTextNode): WikilinkInternalNode {
    return $createWikilinkInternalNode(serializedNode.text);
  }

  static clone(node: WikilinkInternalNode): WikilinkInternalNode {
    console.log("cloning", node.getTextContent(), node.__key);
    return new WikilinkInternalNode(node.getTextContent(), node.__key);
  }
}

export function $createWikilinkInternalNode(text: string): WikilinkInternalNode {
  // used to be applyNodeReplacement no idea why
  return new WikilinkInternalNode(text);
}

/** @noInheritDoc */
export class WikilinkNode extends ElementNode {

  static getType(): string {
    return 'wikilink';
  }

  static clone(node: WikilinkNode): WikilinkNode {
    return new WikilinkNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {

    // create a parent span element for the wikilink
    const element = document.createElement('span');
    return element;
  }

  updateDOM(_prevNode: unknown, _dom: HTMLElement, config: EditorConfig): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedWikilinkNode): WikilinkNode {
    return $createWikilinkNode();
  }

  exportJSON(): SerializedWikilinkNode {
    return {
      ...super.exportJSON(),
      type: 'wikilink',
      version: 1
    };
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  isTextEntity(): boolean {
    return false;
  }
}

/**
 * Generates a WikilinkNode, which is a string following the format of [[text]].
 * @param text - The text used inside the WikilinkNode.
 * @returns - The WikilinkNode with the embedded text.
 */
export function $createWikilinkNode(): WikilinkNode {
  //return $applyNodeReplacement(new WikilinkNode());
  return new WikilinkNode();
}

/**
 * Determines if node is a WikilinkNode.
 * @param node - The node to be checked.
 * @returns true if node is a WikilinkNode, false otherwise.
 */
export function $isWikilinkNode(
  node: LexicalNode | null | undefined,
): node is WikilinkNode {
  return node instanceof WikilinkNode;
}
