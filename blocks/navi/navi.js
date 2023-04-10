export function getRootPath() {
  return ``;
}

/**
 * fetches article index.
 * @returns {object} index with data and path lookup
 */
async function fetchBlogArticleIndex() {
  const pageSize = 500;
  window.articleIndex = window.articleIndex || {
    data: [],
    byPath: {},
    offset: 0,
    complete: false,
  };
  if (window.articleIndex.complete) return (window.articleIndex);
  const index = window.articleIndex;
  const resp = await fetch(`${getRootPath()}/query-index.json??sheet=documents&limit=${pageSize}&offset=${index.offset}`);
  const json = await resp.json();
  const complete = (json.limit + json.offset) === json.total;
  json.data.forEach((post) => {
    index.data.push(post);
    index.byPath[post.path.split('.')[0]] = post;
  });
  index.complete = complete;
  index.offset = json.offset + pageSize;
  return (index);
}

function createTreeFromListOfPaths(paths) {
    // I want to preserve order of paths so I can't use a map or a set
    // so I use an object to store a map of path to node
    // and I use an array to store the order of the paths so I can iterate over it later

    const prefix = '/docs/experience-manager-cloud-manager/content/';

    // root node is an empty string containing all other nodes
    const pathToNode = {"/": {name: "", children: []}};
    const pathOrder = ["/"];
    paths.forEach((pathData) => {
      // remove the prefix from the path
        var path = pathData.path.replace(prefix, "");
        var parts = path.split("/");
        var currentPath = ""; // root node is always first
        var currentNode = pathToNode[pathOrder[0]]; // root node is always first
        parts.forEach((part) => {
            currentPath = currentPath + "/" + part;
            if (pathToNode[currentPath] === undefined) {
                pathOrder.push(currentPath);
                pathToNode[currentPath] = {
                    name: part,
                  // add depth to the node
                    path : currentPath,
                    title: pathData.title,
                    depth: currentPath.split("/").length - 1,
                    children: [],
                    parent: currentNode
                };

                currentNode.children.push(pathToNode[currentPath]);
            }
            currentNode = pathToNode[currentPath];
        });
    });

    // return the root node
    return pathToNode[pathOrder[0]];
}


/* 
* Create content div wrapper 
*/
function createContentDiv(block) {

  const contentDiv = document.createElement('div');
  contentDiv.classList.add('content-wrapper');


  const childArray = [...block.parentNode.children];


  childArray.forEach((sibling) => {

      if (!sibling.classList.contains('navi') && !sibling.classList.contains('on-this-page')) {
        // remove sibling from current position
        sibling.parentNode.removeChild(sibling);
        contentDiv.appendChild(sibling);
        
      }
    }
  );

  block.parentNode.appendChild(contentDiv);
  
}

export default async function decorate(block) {

  const prefix = '/docs/experience-manager-cloud-manager/content';


  createContentDiv(block);

  const navigationData = await fetchBlogArticleIndex();

  const tree = createTreeFromListOfPaths(navigationData.data);

  const ul = document.createElement('ul');
  block.appendChild(ul);

  tree.ul = ul;

  // create new array with all children of the root node
  // this is the first level of the navigation
  var queue = tree.children.slice();

  while (queue.length > 0) {
    var currentNode = queue.shift(); // remove first element from queue

    var li = document.createElement('li');
    var a = document.createElement('a');

    // register click event on a tag
    a.addEventListener('click', (event) => {
        // if the clicked node has children then toggle the nav-hidden class
        if (event.target.parentNode.children.length > 1) {
            event.target.parentNode.children[1].classList.toggle('nav-hidden');
            event.target.classList.toggle('is-open');
        }
    });

    a.innerText = currentNode.title;

    // if current node has children then href is #
    // otherwise href is the path
    if (currentNode.children.length > 0) {
      a.href = "#";
    } else {
      a.href = prefix + currentNode.path;

    }

    li.appendChild(a);
    currentNode.a = a;

    if (currentNode.parent !== undefined) {
      currentNode.parent.ul.appendChild(li);
    }

    // add ul to li if current node has children
    if (currentNode.children.length > 0) {
      var currentUl = document.createElement('ul');
      // if current node depth is greater than 1 then hide the ul
      if (currentNode.depth >= 1) {
        currentUl.classList.add('nav-hidden');

      }
      currentNode.ul = currentUl;
      li.appendChild(currentUl);
    }

      // if current node is on the selected path then show the ul
      if (window.location.pathname.startsWith(prefix + currentNode.path)) {
          // if this is a leaf node
          if (currentNode.children.length === 0) {
              a.classList.add("is-active");
          } else {
              currentNode.ul.classList.remove('nav-hidden');
              currentNode.ul.classList.add("is-open");
              currentNode.a.classList.add("is-open");
          }
      }

    currentNode.children.forEach((child) => {
      queue.push(child);
    });
  }
}
