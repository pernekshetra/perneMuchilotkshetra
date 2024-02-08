window.onload = () => {
  const listingParent = document.getElementById("oushadhavana-listing");
  for(const plant of data) {
    const listingChild = document.createElement("li");
    const a = document.createElement('a');
    const linkText = document.createTextNode(plant.name);
    a.appendChild(linkText);
    a.title = plant.name;
    a.href = plant.link;
    listingChild.appendChild(a);
    listingParent.appendChild(listingChild);
  }
};
