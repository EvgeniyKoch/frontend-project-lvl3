const container = document.querySelector('.rss-items');
const jumbotron = document.querySelector('.jumbotron');

export const renderError = (element, error) => {
  if (!error) {
    element.classList.remove('is-invalid');
    return;
  }

  element.classList.add('is-invalid');
};

export const renderMessage = (message, type) => {
  const oldAlert = document.querySelector('.alert');

  if (oldAlert) {
    oldAlert.remove();
  }

  const newAlert = document.createElement('div');
  newAlert.classList.add('alert', `alert-${type}`);
  newAlert.style.marginTop = '10px';
  newAlert.style.textAlign = 'center';
  newAlert.style.marginBottom = '-30px';
  newAlert.innerText = message;
  jumbotron.append(newAlert);
};

export const render = ({ channels, listPosts }) => {
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
    link.innerText = `${channel.title}`;
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
