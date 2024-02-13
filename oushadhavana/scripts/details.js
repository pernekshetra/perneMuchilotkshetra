import plants from "../data.mjs";

const { createApp, ref } = Vue;

const app = {
  setup() {
    const plant = ref(plants.filter((plant) => {
      return (plant['Sanskrit Name'].toLowerCase().replace(/\s+/g, '_') == window.location.pathname.split('/')[2])
    })[0]);
    return {
      plant: plant
    }
  }
}

createApp(app).mount('#app')
