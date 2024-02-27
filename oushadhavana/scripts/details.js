import plants from "../data.mjs";
import plantImages from "../plantImages.mjs";

const { createApp, ref } = Vue;

const app = {
  setup() {
    const mappedPlants = plants.map((plant) => {
      plant.images = plantImages[plant['Sanskrit Name'].toLowerCase().replace(/\s+/g, '_')];
      return plant;
    });
    const plant = ref(mappedPlants.filter((plant) => {
      return (plant['Sanskrit Name'].toLowerCase().replace(/\s+/g, '_') == window.location.pathname.split('/')[2])
    })[0]);
    const makeFirstTwoWordsItalic = (text) => {
      const words = text?.split(" ");
      if (words.length >= 2) {
        const firstTwoWordsItalic = `<span style="font-style: italic">${words[0]} ${words[1]}</span>`;
        return firstTwoWordsItalic + " " + words.slice(2).join(" ");
      } else {
        return text;
      }
    }
    return {
      plant: plant,
      makeFirstTwoWordsItalic
    }
  }
}

createApp(app).mount('#app')
