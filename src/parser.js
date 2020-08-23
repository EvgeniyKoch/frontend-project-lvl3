const parser = new DOMParser();

export default (data) => {
  const document = parser.parseFromString(data, 'text/xml');
  const channelNod = document.querySelector('channel');
  const postsNodeList = channelNod.querySelectorAll('item');
  const title = channelNod.querySelector('title').textContent;
  const description = channelNod.querySelector('description').textContent;
  const listPosts = [];

  postsNodeList.forEach((item) => {
    const post = {
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    };
    listPosts.push(post);
  });

  return { title, description, listPosts };
};
