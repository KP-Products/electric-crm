import { Grid } from 'antd';

const { useBreakpoint } = Grid;

export const useResponsive = () => {
  const { xs, sm, md, lg, xl, xxl } = useBreakpoint();

  return {
    isMobile: xs && !sm,
    isTablet: (sm || md) && !lg,
    isDesktop: lg || xl || xxl
  };
};
