window.onload = () => {
  const descriptionParent = document.getElementById("description-oushadhavana-plant");
  const metaDataPlant = document.getElementById("plant-metadata");
  for(const plant of data) {
    if(window.location.pathname.split("/").includes(plant.link)) {
      const listingChildSN = document.createElement("li");
      const childTextScientificName = document.createTextNode(plant.scientific_name);
      listingChildSN.appendChild(childTextScientificName);
      metaDataPlant.appendChild(listingChildSN);

      const listingChildMN = document.createElement("li");
      const childTextMalayalamName = document.createTextNode(plant.malayalam_name);
      listingChildMN.appendChild(childTextMalayalamName);
      metaDataPlant.appendChild(listingChildMN);
    }
  }
};
