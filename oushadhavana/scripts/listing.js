import plants from "../data.js";

const { createApp, ref } = Vue;

const app = {
  setup() {
    const plantsArray = ref(plants);
    return {
      plants: plantsArray
    }
  }
}

createApp(app).mount('#app')
