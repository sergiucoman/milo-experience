export default async function decorate(block) {

  const div = document.createElement('div');
  div.textContent = "Note";

  // inserrt div as first element of block
  block.insertBefore(div, block.firstChild);
}
