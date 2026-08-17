/**
 * Incoming styles barrel.
 * Merges list, form, editor, and modal styles into a single default export
 * so existing `import styles from '../styles'` (or './styles') imports
 * continue to work without changes.
 */
import listStyles from './list.styles';
import formStyles from './form.styles';
import editorStyles from './editor.styles';
import modalStyles from './modal.styles';

const styles = {
    ...listStyles,
    ...formStyles,
    ...editorStyles,
    ...modalStyles,
};

export default styles;

// Named sub-exports for components that need to import a single group
export { listStyles, formStyles, editorStyles, modalStyles };
