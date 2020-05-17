import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import { isEqual, uniqBy } from 'lodash';

import watch from './view';
import renderNodeToListFeed from './parser';
import resources from './locales';

const routes = {
  proxy: (url) => `https://cors-anywhere.herokuapp.com/${url}`,
};

const request = axios.create({
  timeout: 5000,
});

const schema = yup.object().shape({
  website: yup.string().url(),
});

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

export default async () => {
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

  const [form] = document.forms;
  const [searchInput] = form.elements;

  i18next.init({ lng: 'en', debug: false, resources })
    .then(() => watch(state, form));

  const setStateListFeeds = ([channel, listPosts]) => {
    if (isEqual(listPosts, state.listFeeds.listPosts)) {
      return;
    }

    state.listFeeds.channels = [channel, ...state.listFeeds.channels];
    state.listFeeds.listPosts = [...listPosts, ...state.listFeeds.listPosts];
  };

  const requestRss = (url) => {
    request.get(url)
      .then(({ data }) => {
        state.form.processState = 'finished';
        state.form.allUrls = uniqBy([...state.form.allUrls, url]);
        const newListFeeds = renderNodeToListFeed(data);
        setStateListFeeds(newListFeeds);
        setTimeout(() => requestRss(url), 5000);
      })
      .catch((err) => {
        state.form.processError = true;
        state.form.processState = 'failed';
        throw err;
      });
  };

  const validateUrl = (url) => {
    const hasUrl = state.form.allUrls.some((item) => item === routes.proxy(url));
    if (!hasUrl) {
      return null;
    }

    state.form.processError = i18next.t('errors.double');
    state.form.processState = 'failed';
    throw new Error(i18next.t('errors.double'));
  };

  searchInput.addEventListener('input', (e) => {
    const { value } = e.target;
    state.form.field.website = value;
    updateValidationState(state);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.form.processState = 'sending';
    const { website } = state.form.field;
    validateUrl(website);
    requestRss(routes.proxy(website));
  });
};
