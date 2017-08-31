<template lang="jade">
div
  v-container
    v-layout(wrap='')
      v-flex(xs12='', sm9='', offset-sm1='')
        v-card.pr-2.pt-2.mb-3(v-for='post in posts', v-bind:key='post.id', hover='')
          v-card-title
            h4.text-xs-justify.pl-4.post-title
              | {{post.title}}
            v-spacer
            template(v-if='post.user_id === api.user.id')
              v-btn(icon='', @click.stop='editPost(post)')
                v-icon edit
              v-btn(icon='', @click='deletePost(post)')
                v-icon delete
          .text-xs-center(style='margin:0 auto;', v-if='post.image')
            img(:src='post.image.url', style='max-width:100%;max-height:200px', alt='')
          v-card-text.pl-5.text-xs-justify(justify-center='')
            div(v-html='post.text')
          v-divider
          v-card-text.by.text-xs-right
            v-layout
              v-flex.text-xs-left(xs6='')
                v-chip.primary.white--text(v-for='tag in post.tags', v-if='post.tags && tag.name.length>0', v-bind:key='tag.id') {{tag.name}}
              v-flex(xs6='')
                span.headline-2.mr-4(v-if='post.user') {{post.user.name}}
                span.grey--text
                  | {{ post.created_at | moment('from')}}
      v-btn.primary(fixed='', fab='', bottom='', right='', dark='', @click.stop='newPost()')
        v-icon add
    v-dialog(fullscreen='', v-model='creator')
      v-toolbar.indigo(dark='')
        v-toolbar-title
          | {{api.trans('crud.add')}} {{api.trans('literals.post')}}
        v-spacer
        v-btn(icon='', @click='creator=false')
          v-icon close
      v-card
        v-card-text
          v-container()
            v-layout()
              v-flex(xs12="")
                v-text-field(v-model='post.title', :label="api.trans('literals.title')")
                quill-editor(v-model='post.text', ref='myQuillEditor', :options='editorOption')
                input(type="file" ref="inputImage" style="display:none;", @change="fileUploaded" accept="image/*")
                div.text-center
                  img(:src="post_image", v-if="!!post_image" style="max-width:240px; margin: 0 auto;")
                v-btn.grey.lighten-2(block large, @click.stop="askFile()")
                  v-icon() camera_alt
                v-select(:label="api.trans('literals.tags')", v-bind:items='tags', v-model='post.tags', item-text='name', item-value='id', multiple='', chips='', max-height='auto', autocomplete='')
                v-flex.text-xs-right
                  v-spacer
                  v-btn(primary='', v-if='!post.id', @click='createPost()', :disabled="!canSave()", :loading="uploading")
                    v-icon(dark='') save
                    |  {{api.trans('crud.save')}}
                  v-btn(primary='', v-else='', @click='updatePost(post)', :disabled="!canSave()")
                    v-icon(dark='') save
                    |  {{api.trans('crud.save')}}
                  v-btn(flat='', @click='creator=false')
                    |  {{api.trans('crud.cancel')}}
</template>

<script lang="coffee">
api = require '../services/api.js'
module.exports =
  name: 'Posts',

  mounted: ()->
    @getPosts()
  data: ->
      api: api,
      creator: false,
      posts: []
      tags: []
      post: {
        title: ''
        text: ''
        tags: []
      },
      post_image: null,
      editorOption: {}
      uploading:false
  methods:
    getPosts:()->
      @api.get('posts?limit=100&order[created_at]=desc&with[]=user&with[]=image&with[]=tags')
        .then (resp)=>
          console.log resp.data
          @posts = resp.data
          if @$route.query.create
            this.newPost()
        .catch (error)=>
          console.error error
      @api.get('tags')
        .then (resp)=>
          console.log resp.data
          @tags = resp.data
        .catch console.error
    newPost: ()->
      @post=
        user_id: api.user.id
        title: ''
        text: ''
        tags: []
      @post_image = null
      @creator = true
    askFile: ()->
      @$refs.inputImage.click()
    fileUploaded: (evt)->
      return if !evt.target.files[0]?
      reader= new FileReader()
      reader.readAsDataURL evt.target.files[0], "UTF-8"
      reader.onload= (evt)=>
        @post_image=evt.target.result
    createPost:()->
      @post.user_id = api.user.id
      @uploading=true
      @api.post('posts', @post)
      .then (response)=>
        if @post_image?
          @api.upload('post',response.data.id,@post_image)
          .then (resp)=>
            @creator = false
            @uploading = false
            @getPosts()
          .catch console.error
        else
          @creator = false
          @uploading = false
          @getPosts()
      .catch console.error
    canSave: ()->
      @post.title?.length > 3 && @post.text?.length>3
    editPost: (post)->
      @post = post
      @creator = true;
    updatePost: (post)->
      @uploading=true
      @post = JSON.parse JSON.stringify(post)
      delete @post.residence
      delete @post.user
      delete @post.image
      delete @post.image_url
      @post.user_id = @api.user.id
      @api.put('posts/' + @post.id, @post)
        .then (response)=>
          if @post_image?
            @api.upload('post',response.data.id,@post_image)
            .then (resp)=>
              @creator = false
              @uploading = false
              @getPosts()
            .catch console.error
          else
            @creator = false
            @uploading = false
            @getPosts()
        .catch console.error
    deletePost: (post)->
      return if  !confirm api.trans('__.are you sure')
      @api.delete 'posts/'+post.id
        .then (response)=>
          @creator = false
          @getPosts()
        .catch console.error
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
</style>
