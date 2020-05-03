import axios from 'axios';
import * as yup from 'yup';

import watch from './view';
import parse from './parser';

const routes = {
  proxy: () => 'https://cors-anywhere.herokuapp.com/',
};

const request = axios.create({
  timeout: 5000,
});

const schema = yup.object().shape({
  website: yup.string().url(),
});

const errorMessages = {
  network: {
    error: 'Network Problems. Try again.',
  },
};

const updateValidationState = (state) => {
  try {
    schema.validateSync(state.form.field);
    state.form.valid = true;
    state.form.error = '';
  } catch (e) {
    state.form.error = e.message;
    state.form.valid = false;
  }
};

export default () => {
  const state = {
    form: {
      processState: 'filling',
      processError: null,
      field: {
        website: '',
      },
      valid: true,
      error: '',
    },
    listFeed: {
      channel: [],
      listPosts: [],
    },
  };

  const [form] = document.forms;
  const [searchInput] = form.elements;

  watch(state, form);

  searchInput.addEventListener('input', (e) => {
    state.form.field.website = e.target.value;
    updateValidationState(state);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    state.form.processState = 'sending';
    const { website } = state.form.field;
    request.get(`${routes.proxy()}${website}`)
      .then(({ data }) => {
        state.form.processState = 'finished';
        parse(data);
      })
      .catch((err) => {
        state.form.processError = errorMessages.network.error;
        state.form.processState = 'failed';
        throw err;
      });
  });
};
