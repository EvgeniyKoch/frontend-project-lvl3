import { watch } from 'melanke-watchjs';

const container = document.querySelector('.rss-items');
const jumbotron = document.querySelector('.jumbotron');

const renderError = (element, error) => {
  if (!error) {
    element.classList.remove('is-invalid');
    return;
  }
  element.classList.add('is-invalid');
};

const render = ({ channels, listPosts }) => {
  container.innerHTML = '';
  channels.forEach((channel) => {
    const posts = listPosts.filter(({ channelId }) => channelId === channel.id);
    const card = document.createElement('div');
    const cardHeader = document.createElement('h5');
    const body = document.createElement('div');
    const link = document.createElement('a');
    card.classList.add('card');
    cardHeader.classList.add('card-header');
    body.classList.add('card-body');
    link.classList.add('nav-link');
    link.setAttribute('href', channel.link);
    link.innerText = `${channel.title} / ${channel.description}`;
    cardHeader.append(link);
    card.append(cardHeader);
    posts.forEach((post) => {
      const linkPost = document.createElement('a');
      linkPost.classList.add('nav-link');
      linkPost.setAttribute('href', post.link);
      linkPost.innerText = `${post.title} / ${post.description}`;
      body.append(linkPost);
    });
    card.append(body);
    container.append(card);
  });
};

const renderWarning = (message) => {
  const alert = document.createElement('div');
  alert.classList.add('alert', 'alert-danger');
  alert.style.marginTop = '10px';
  alert.style.textAlign = 'center';
  alert.innerText = message;
  jumbotron.append(alert);
};

export default (state, form) => {
  const [searchInput, submitButton] = form;

  watch(state.form.field, 'website', () => {
    renderError(searchInput, state.form.error);
  });

  watch(state.form, 'valid', () => {
    submitButton.disabled = !state.form.valid;
  });

  watch(state.form, 'processError', () => { // TODO change view message, add i18next
    renderWarning(state.form.processError);
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
        submitButton.disabled = false;
        form.reset();
        render(state.listFeeds);
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  });
};
