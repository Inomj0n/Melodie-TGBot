export const formatCaption = (music) => {
  let caption = music.title;
  if (music.author) caption += `\nAdded by: ${music.author}`;
  if (music.album?.name) caption += `\nAlbum: ${music.album.name}`;
  return caption;
};