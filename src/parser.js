const parser = new DOMParser();

export default (data) => {
  const document = parser.parseFromString(data, 'text/html');
  const channelNod = document.querySelector('channel');
  const postsNodeList = channelNod.querySelectorAll('item');

  const channel = {
    title: channelNod.querySelector('title').innerText,
    description: channelNod.querySelector('description').innerText,
    link: channelNod.querySelector('link').nextSibling.textContent.trimEnd(),
  };

  const listPosts = [];
  postsNodeList.forEach((item) => {
    const post = {
      title: item.querySelector('title').innerText,
      description: item.querySelector('description').innerText,
      link: item.querySelector('link').nextSibling.textContent.trimEnd(),
    };
    listPosts.push(post);
  });

  return [channel, listPosts];
};
