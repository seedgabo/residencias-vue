<template>
  <div>
    <v-container>
      <v-layout wrap>
        <v-flex xs12 sm9 offset-sm1>
          <v-card v-for="post in posts" class="pr-2 pt-2 mb-3" v-bind:key="post.id" hover>
            <v-card-title>
              <h4 class="text-xs-justify pl-4 post-title">{{post.title}}
              </h4>
              <v-spacer></v-spacer>
              <template v-if="post.user_id === api.user.id">
                <v-btn icon @click.stop="editPost(post)">
                  <v-icon>edit</v-icon>
                </v-btn>
                <v-btn icon @click="deletePost(post)">
                  <v-icon>delete</v-icon>
                </v-btn>
              </template>
            </v-card-title>
            <div style="margin:0 auto;" class="text-xs-center" v-if="post.image">
              <img :src="post.image.url" style="height:100px" alt="">
            </div>
            <v-card-text class="pl-5 text-xs-justify" justify-center>
              <div v-html="post.text"></div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text class="by text-xs-right">
              <v-layout>
                <v-flex xs6 class="text-xs-left">
                  <v-chip class="primary white--text" v-for="tag in post.tags" v-if="post.tags && tag.name.length>0" v-bind:key="tag.id">{{tag.name}}</v-chip>
                </v-flex>
                <v-flex xs6>
                  <span class="headline-2 mr-4" v-if="post.user">{{post.user.name}}</span>
                  <span class="grey--text">
                    {{ post.created_at | moment('from')}}
                  </span>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-btn fixed fab bottom right class="primary" dark @click.stop="creator=true">
          <v-icon>add</v-icon>
        </v-btn>
      </v-layout>
  
      <v-dialog fullscreen v-model="creator">
        <v-toolbar class="indigo" dark>
          <v-toolbar-title>
            {{api.trans('crud.add')}} {{api.trans('literals.post')}}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="creator=false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card>
          <v-card-text>
            <v-container>
              <v-text-field v-model="post.title" :label="api.trans('literals.title')"></v-text-field>
              <quill-editor v-model="post.text" ref="myQuillEditor" :options="editorOption">
              </quill-editor>
  
              <!-- <span v-html="post.text"></span> -->
              <v-flex class="text-xs-right">
                <v-spacer></v-spacer>
                <v-btn primary v-if="!post.id" @click="createPost()">
                  <v-icon dark>save</v-icon>
                  &nbsp; {{api.trans('crud.save')}}
                </v-btn>
  
                <v-btn primary v-else @click="updatePost(post)">
                  <v-icon dark>save</v-icon>
                  &nbsp; {{api.trans('crud.save')}}
                </v-btn>
  
                <v-btn flat @click="creator=false">
                  {{api.trans('crud.cancel')}}
                </v-btn>
              </v-flex>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
var api = require('../services/api.js')
export default {
  name: 'Posts',
  mounted() {
    this.getPosts()
  },
  data() {
    return {
      api: api,
      creator: false,
      posts: [],
      post: {
        title: '',
        text: ''
      },
      editorOption: {}
    }
  },
  methods: {
    getPosts: function () {
      this.api.get('posts?limit=100&order[created_at]=desc&with[]=user&with[]=image&with[]=tags')
        .then((resp) => {
          console.log(resp.data)
          this.posts = resp.data
        })
        .catch((error) => {
          console.error(error)
        })
    },
    newPost: function () {
      this.post = {
        user_id: api.user.id,
        title: '',
        text: ''
      }
      this.creator = true;
    },
    createPost: function () {
      this.post.user_id = api.user.id
      this.api.post('posts', this.post)
        .then((response) => {
          this.creator = false
          this.getPosts()
        })
        .catch(console.error)
    },
    editPost: function (post) {
      this.post = post
      this.creator = true;
    },
    updatePost: function (post) {
      this.post = JSON.parse(JSON.stringify(post))
      delete this.post.residence
      delete this.post.user
      delete this.post.image
      delete this.post.image_url

      this.post.user_id = api.user.id
      this.api.put('posts/' + this.post.id, this.post)
        .then((response) => {
          this.creator = false
          this.getPosts()
        })
        .catch(console.error)
    },
    deletePost: function (post) {
      if (!confirm(api.trans('__.are you sure'))) return
      this.api.delete('posts/' + post.id)
        .then((response) => {
          this.creator = false
          this.getPosts()
        })
        .catch(console.error)
    }

  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
