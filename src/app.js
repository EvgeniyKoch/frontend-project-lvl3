import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import { uniqueId, differenceWith } from 'lodash';

import watch from './watchers';
import parse from './parser';
import resources from './locales';

const addProxy = (url) => `https://cors-anywhere.herokuapp.com/${url}`;

const request = axios.create({
  timeout: 5000,
});

const baseSchema = yup.string().url().required();

const validate = (url, state) => {
  const urls = state.channels.map((channel) => channel.url);
  const urlSchema = baseSchema.notOneOf(urls, i18next.t('errors.double'));

  try {
    urlSchema.validateSync(url);
    state.form.valid = true;
    state.form.error = null;
  } catch (e) {
    state.form.valid = false;
    state.form.error = e.message;
  }
};

const intervalRequest = 5000;

const requestNewPosts = (state) => {
  const promises = state.channels.map((channel) => {
    const proxyUrl = addProxy(channel.url);
    return axios.get(proxyUrl)
      .then(({ data }) => {
        const feedData = parse(data);
        const newPosts = feedData.listPosts.map((item) => ({ ...item, channelId: channel.id }));
        const oldPosts = state.listPosts.filter((post) => post.channelId === post.id);
        const posts = differenceWith(
          newPosts,
          oldPosts,
          (comp1, comp2) => comp1.title === comp2.title,
        );
        state.listPosts.unshift(...posts);
      });
  });

  Promise.all(promises).finally(() => {
    setTimeout(() => requestNewPosts(state), intervalRequest);
  });
};

const requestRss = (url, state) => {
  state.form.processState = 'sending';
  const proxyUrl = addProxy(url);
  request.get(proxyUrl)
    .then(({ data }) => {
      const postsData = parse(data);
      const channel = { url, id: uniqueId(), title: postsData.title };
      const posts = postsData.listPosts.map((item) => ({ ...item, channelId: channel.id }));

      state.channels.unshift(channel);
      state.listPosts.unshift(...posts);
      state.form.processError = null;
      state.form.processState = 'finished';
    })
    .catch((err) => {
      state.form.processError = true;
      state.form.processState = 'failed';
      throw err;
    });
};

export default async () => {
  const state = {
    channels: [],
    listPosts: [],
    form: {
      processState: 'filling',
      processError: null,
      valid: true,
      error: null,
    },
  };

  const [form] = document.forms;
  const [searchInput] = form.elements;

  i18next.init({ lng: 'en', debug: false, resources })
    .then(() => {
      watch(state, form);

      searchInput.addEventListener('input', (e) => {
        const { value } = e.target;
        validate(value, state);
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const url = data.get('url');
        validate(url, state);
        requestRss(url, state);
      });

      setTimeout(() => requestNewPosts(state), intervalRequest);
    });
};
