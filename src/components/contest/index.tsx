// Export all contest-related components
export { TimerBox } from './TimerBox';
export { ResizableDivider } from './ResizableDivider';
export { DescriptionPanel } from './DescriptionPanel';
export { CodeEditorPanel } from './CodeEditorPanel';
export { TestCasePanel } from './TestCasePanel';
export { TopBar } from './TopBar';

// Custom scrollbar hiding styles
export const ScrollbarStyles = () => (
  <style>{`
    /* Hide scrollbar for Chrome, Safari and Opera */
    .hide-scrollbar::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    /* Hide scrollbar for IE, Edge and Firefox */
    .hide-scrollbar {
      -ms-overflow-style: none !important;  /* IE and Edge */
      scrollbar-width: none !important;  /* Firefox */
    }
  `}</style>
);
