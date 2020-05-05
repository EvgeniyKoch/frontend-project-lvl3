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
  link: {
    error: 'This address already exists.',
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
      allUrls: [],
      valid: true,
      error: '',
    },
    listFeeds: {
      channels: [],
      listPosts: [],
    },
  };

  const setState = ([channel, listPosts]) => {
    state.listFeeds.channels = [channel, ...state.listFeeds.channels];
    state.listFeeds.listPosts = [...listPosts, ...state.listFeeds.listPosts];
  };

  const [form] = document.forms;
  const [searchInput] = form.elements;

  watch(state, form);

  const validateUrl = (url) => {
    const hasUrl = state.form.allUrls.some((item) => item === url);
    if (!hasUrl) {
      return null;
    }

    state.form.processError = errorMessages.link.error;
    state.form.processState = 'failed';
    throw new Error('This address already exists');
  };

  const requestRss = (url) => {
    request.get(url)
      .then(({ data }) => {
        state.form.processState = 'finished';
        return parse(data)
        |> setState;
      })
      .catch((err) => {
        state.form.processError = errorMessages.network.error;
        state.form.processState = 'failed';
        throw err;
      });
  };

  searchInput.addEventListener('input', (e) => {
    const { value } = e.target;
    state.form.field.website = value;
    updateValidationState(state);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    state.form.processState = 'sending';
    const { website } = state.form.field;
    validateUrl(website);
    state.form.allUrls.push(website);
    requestRss(`${routes.proxy()}${website}`);
  });
};
