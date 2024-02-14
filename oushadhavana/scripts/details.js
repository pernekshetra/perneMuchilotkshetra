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
    return {
      plant: plant
    }
  }
}

createApp(app).mount('#app')
