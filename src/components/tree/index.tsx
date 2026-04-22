'use client';

import { DownOutlined } from '@ant-design/icons';
import { Tree, TreeProps } from 'antd';

interface AppTreeProps extends TreeProps {}

const AppTree = ({ ...props }: AppTreeProps) => {
  return <Tree showLine switcherIcon={<DownOutlined />} {...props} />;
};

export default AppTree;
