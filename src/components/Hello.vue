<template>
  <div>
    <v-carousel v-if="sliders.length >1">
      <v-carousel-item v-for="slider in sliders" :key="slider.id" v-bind:src="slider.image.url" transition="fade" reverseTransition="fade">
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
    <v-parallax class="my-parallax" :src="sliders[0].image.url" v-if="sliders.length === 1" height="270">
      <v-layout column align-center justify-center>
        <h3 class="white--text">{{sliders[0].name}}</h3>
        <h5 class="white--text">{{sliders[0].text}}</h5>
      </v-layout>
    </v-parallax>
    <div style="position:relative; z-index:1">
      <v-btn fab absolute top left primary dark medium>
        <v-icon>add</v-icon>
      </v-btn>
    </div>
    <v-layout class="pt-3 pl-2">
      <v-flex xs12 sm8>
        <v-card class="text-xs-center">
          <template v-for="post in posts">
            <v-card-title :key="post.id" class="text-xs-center">
              <div class="headline primary--text">
                {{post.title}}
              </div>
            </v-card-title>
            <v-card-text v-html="post.text.substring(0,100)" class="text-xs-justify">
            </v-card-text>
            <v-card-text class="text-xs-right">
              <span class="headline-2 mr-4" v-if="post.user">{{post.user.name}}</span>
              <span class="grey--text">
                {{ post.created_at | moment('from')}}
              </span>
            </v-card-text>
            <v-divider></v-divider>
          </template>
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
.carousel,
.my-parallax {
  height: 270px;
}
</style>
