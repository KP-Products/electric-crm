import { TreeNode } from 'components/tree-select';
import { Product } from 'model/product';

export const buildMaps = (treeData: TreeNode[]) => {
  const valueMap: Record<string, TreeNode> = {};
  const parentMap: Record<string, string | null> = {};
  const descendantMap: Record<string, string[]> = {};

  const loop = (nodes: TreeNode[], parent: string | null = null) => {
    nodes.forEach((node) => {
      valueMap[node.value] = node;
      parentMap[node.value] = parent;

      if (node.children?.length) {
        loop(node.children, node.value);
      }
    });
  };

  loop(treeData);

  // build descendantMap (post-order)
  const buildDescendants = (node: TreeNode): string[] => {
    if (!node.children?.length) {
      descendantMap[node.value] = [];
      return [];
    }

    let result: string[] = [];

    node.children.forEach((child) => {
      result.push(child.value);
      result = result.concat(buildDescendants(child));
    });

    descendantMap[node.value] = result;
    return result;
  };

  treeData.forEach(buildDescendants);

  return { valueMap, parentMap, descendantMap };
};

export const convertToTree = (data: Product[]): TreeNode[] => {
  const traverse = (node: Product): TreeNode => {
    const children: TreeNode[] = [];

    // handle listChild (normal node)
    if (node.listChild?.length) {
      children.push(...node.listChild.map(traverse));
    }

    // handle listCodeFee (leaf node)
    if (node.listCodeFee?.length) {
      children.push(
        ...node.listCodeFee.map((fee) => ({
          value: fee.id || '',
          title: fee.name || fee.code || '',
          type: 'fee_code',
          raw: fee
        }))
      );
    }

    return {
      value: node.id,
      title: node.name || node.code || '',
      children: children.length ? children : undefined
    };
  };

  return data.map(traverse);
};

export const onChangeTreeSelectFeeSchedule = (
  val: any[],
  extra: any,
  valueMap: Record<string, TreeNode>,
  parentMap: Record<string, string | null>,
  descendantMap: Record<string, string[]>,
  setSelectedValues: any
) => {
  const triggerValue = extra?.triggerValue;
  const checked = extra?.checked;

  const currentSet = new Set<string>(
    (val || []).map((item) => (typeof item === 'string' ? item : item.value))
  );

  // =========================
  // CHECK
  // =========================
  if (checked && triggerValue) {
    const children = descendantMap[triggerValue] || [];
    children.forEach((c) => currentSet.add(c));
  }

  // =========================
  // UNCHECK
  // =========================
  if (!checked && triggerValue) {
    const children = descendantMap[triggerValue] || [];

    // remove subtree + chính nó
    children.forEach((c) => currentSet.delete(c));
    currentSet.delete(triggerValue);

    const parent = parentMap[triggerValue];

    if (parent) {
      const siblings = valueMap[parent]?.children || [];

      const isAllSiblingsUnchecked = siblings.every((child) => !currentSet.has(child.value));

      if (isAllSiblingsUnchecked) {
        // tìm root
        let root = parent;

        while (parentMap[root]) {
          root = parentMap[root] as string;
        }

        // clear toàn bộ root subtree (O(1))
        const allNodes = [root, ...(descendantMap[root] || [])];
        allNodes.forEach((v) => currentSet.delete(v));
      }
    }
  }

  const result = Array.from(currentSet).map((value) => ({
    value,
    label: valueMap[value]?.title,
    type: valueMap[value]?.type
  }));

  setSelectedValues?.(result);
};

export const filterTreeNodeFeeSchedule = (input: string, node: any) => {
  const normalize = (str: string = '') =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .trim();
  const keywords = normalize(input).split(' ').filter(Boolean);
  if (!keywords.length) return true;
  const text = normalize(
    typeof node.title === 'string' ? node.title : node.title?.props?.children || ''
  );
  return keywords.every((k) => text.includes(k));
};
