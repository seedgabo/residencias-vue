<template>
  <div>

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
    <v-layout class="pt-3 pl-2">
      <v-flex xs12 sm9>
        <v-card>
          <div v-for="post in posts" :key="post.id">
            <v-card-title>
              <h3 class="headline">
                {{post.title}}
              </h3>
            </v-card-title>
            <v-card-text v-html="post.text.substring(0,100)"></v-card-text>
          </div>
          <v-card-actions>
            <v-btn full block flat :to="'posts'">
              {{api.trans('literals.view_resource')}} {{api.trans('literals.more')}}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
export default {
  name: 'hello',
  mounted() {
    this.api.ready
      .then(() => {
        this.getSliders();
        this.getPosts();
      });
  },
  data() {
    return {
      sliders: [],
      posts: [],
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
    },
    getPosts() {
      this.api.get('posts?limit=10&order[created_at]=desc&with[]=user&with[]=image')
        .then((response) => {
          console.log(response.data)
          this.posts = response.data;
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
