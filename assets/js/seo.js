function setSEO({ title, description, url, image }) {
  document.title = title;
  document.querySelector("#meta-title").innerText = title;
  document.querySelector("#meta-description").setAttribute("content", description);
  document.querySelector("#canonical-url").setAttribute("href", url);

  document.querySelector("meta[property='og:title']").setAttribute("content", title);
  document.querySelector("meta[property='og:description']").setAttribute("content", description);
  document.querySelector("meta[property='og:url']").setAttribute("content", url);
  document.querySelector("meta[property='og:image']").setAttribute("content", image);

  document.querySelector("meta[name='twitter:title']").setAttribute("content", title);
  document.querySelector("meta[name='twitter:description']").setAttribute("content", description);
  document.querySelector("meta[name='twitter:image']").setAttribute("content", image);
}