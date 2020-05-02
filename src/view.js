import { watch } from 'melanke-watchjs';

const renderError = (element, error) => {
  if (!error) {
    element.classList.remove('is-invalid');
    return;
  }
  element.classList.add('is-invalid');
};

export default (state, form) => {
  const [searchInput, submitButton] = form;
  const container = document.querySelector('.rss-items');

  watch(state.form.field, 'website', () => {
    renderError(searchInput, state.form.error);
  });

  watch(state.form, 'valid', () => {
    submitButton.disabled = !state.form.valid;
  });

  watch(state.form, 'error', () => {
    renderError(searchInput, state.form.error);
  });

  watch(state.form, 'processState', () => {
    const { processState } = state.form;
    switch (processState) {
      case 'failed':
        submitButton.disabled = false;
        break;
      case 'filling':
        submitButton.disabled = false;
        break;
      case 'sending':
        submitButton.disabled = true;
        break;
      case 'finished':
        container.innerHTML = 'User Created!';
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  });
};
