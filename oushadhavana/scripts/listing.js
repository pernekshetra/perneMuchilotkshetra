import plants from "../data.mjs";
const { createApp, ref } = Vue;

const app = {
  setup() {
    const plantsArray = ref(plants);
    const groupBy = (array, property) => {
      return array.reduce((acc, obj) => {
        const key = obj[property];
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
      }, {});
    }
    return {
      plants: groupBy(plantsArray.value, "Type")
    }
  }
}

createApp(app).mount('#app')
