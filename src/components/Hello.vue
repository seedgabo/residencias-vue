<template>
  <v-carousel v-if="sliders.length >0">
    <v-carousel-item v-for="slider in sliders" :key="slider.id" v-bind:src="slider.image.url">
      <v-layout row wrap>
        <v-flex xs12>
          <h3 class="white--text">{{slider.name}}</h3>
        </v-flex>
        <v-flex xs12>
          <p class="white--text">{{slider.text}}</p>
        </v-flex>
      </v-layout>
    </v-carousel-item>
  </v-carousel>
  <!-- <v-container> -->
  <!-- </v-container> -->
</template>

<script>
export default {
  name: 'hello',
  mounted() {
    this.api.ready
      .then(() => {
        this.getSliders();
      });
  },
  data() {
    return {
      sliders: [],
      api: require('../services/api.js'),
    }
  },
  methods: {
    getSliders() {
      this.api.get('sliders?with[]=image')
        .then((response) => {
          console.log(response.data)
          this.sliders = response.data;
        })
        .catch(console.error)
    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.carousel {
  height: 300px;
}
</style>
