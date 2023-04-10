export default function decorate(block) {

  const parent=block.parentElement.parentElement

  const h2Elements = parent.querySelectorAll("h2, h3");

  const h2 = document.createElement('h2');
  block.appendChild(h2);

  h2.textContent = "On this page";

  const ul = document.createElement('ul');

  h2Elements.forEach((index) => {
    var li = document.createElement('li');

    if (index.localName === 'h3') {
      li.classList.add("is-padded-left-big");
    }

    ul.appendChild(li);

    var a = document.createElement('a');

    var link = document.createTextNode(index.innerText);

    // Append the text node to anchor element.
    a.appendChild(link);

    // Set the title.
    a.title = index.innerText;

    // Set the href property.
    a.href = "#" + index.id;

    li.appendChild(a);
  });

  block.appendChild(ul);
}
