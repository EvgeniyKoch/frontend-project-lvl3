import { watch } from 'melanke-watchjs';
import i18next from 'i18next';

import { renderError, renderMessage, render } from './render';

export default (state, form) => {
  const [searchInput, submitButton] = form;

  watch(state.form.field, 'website', () => {
    renderError(searchInput, state.form.error);
  });

  watch(state.form, 'valid', () => {
    submitButton.disabled = !state.form.valid;
  });

  watch(state.form, 'processError', () => {
    if (state.form.processError) {
      renderMessage(i18next.t('errors.network'), 'danger');
      return;
    }

    renderMessage(i18next.t('success'), 'success');
  });

  watch(state.form, 'error', () => {
    renderError(searchInput, state.form.error);
  });

  watch(state.form, 'processState', () => {
    const { processState } = state.form;
    switch (processState) {
      case 'failed':
        form.reset();
        submitButton.disabled = false;
        break;
      case 'filling':
        submitButton.disabled = false;
        break;
      case 'sending':
        submitButton.disabled = true;
        break;
      case 'finished':
        state.form.processError = null;
        submitButton.disabled = false;
        form.reset();
        render(state);
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  });
};
