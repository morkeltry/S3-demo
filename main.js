const picContainerDiv = document.getElementById('pics');
const s3FolderLocation = 'https://app-that-makes-ya-go-aw.s3.eu-west-2.amazonaws.com';
const picUrls = [
  './assets/aw.jpg', // local file
  // 'https://app-that-makes-ya-go-aw.s3.eu-west-2.amazonaws.com/folder/1583086050747_aw.jpg',
];

// this function takes an array of filenames and adds them as images into the document.
function addPics (picUrls) {
  picUrls.forEach (url => {
    const newImg = document.createElement('img');
    newImg.src = url;
    newImg.style="max-height:500px; max-width:500px;";
    picContainerDiv.appendChild(newImg);
  });
}

// Always add the pics from the URLs in the array above
addPics (picUrls);

// we'll only run this if there are no picture URLs in that array.
if (picUrls.length === 0)
  listBucketContents( s3FolderLocation )
    .then(newUrls=> addPics(newUrls) );


// _______________________________________________________________________________
// Function definitions

function listBucketContents (location) {
  // will return a Promise that resolves to an array of URLs.
  return (
    // Perform an HTTP request to s3FolderLocation
    fetch (location)
      // Take the contents of the response
      .then(response=> response.text())
      // Turn the response contents from XML into a tree of Nodes
      .then(text=> (new window.DOMParser()).parseFromString(text, "text/xml"))
      // Pick the leaf Nodes we want from the tree
      .then(xml=> filterNodes(xml,'ListBucketResult'))
      .then(xml=> filterNodes(xml[0],'Contents'))
      .then(arr=> arr.map(xml=> filterNodes(xml,'Key')))
      // Retrieve the text content from the Nodes
      .then(arr=> arr.map(xml=> xml[0].innerHTML))
      // Create an absolute URL from a relative URL
      .then (filenames=> filenames.map(file=> `${location}/${file}`))
  )
}

function filterNodes(nodeList, name) {
  const returnList = [];
  nodeList.childNodes.forEach( node=> {
    if (node.nodeName === name)
      returnList.push(node)
  })
  return returnList
}
