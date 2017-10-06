<template lang="jade">
v-layout(wrap)
  input(type="file" ref="inputImage" style="display:none;", @change="fileUploaded" accept="image/*")
  v-flex(xs12)
    v-card(dense)
      v-card-title
        v-icon work
        span &nbsp; {{api.trans('literals.workers')}}
        v-spacer
        v-btn.pink(dark fab small absolute right, @click.stop="worker={name:'',document:'',phone_number:'',schedule_id:''};creator=true")
          v-icon add
      v-card-text
        v-list(dense three-line)
          v-list-tile(v-for="worker in api.residence.workers", :key="worker.id", avatar="")
            v-list-tile-avatar(@click="askFile(worker)")
              img.large(v-if="worker.image_id", :src="worker.image_url")
              v-icon.primary.white--text(v-else) add_a_photo
            v-list-tile-content
              v-list-tile-title.body-2 {{worker.name}}
              v-list-tile-sub-title.caption {{worker.document}}
              v-list-tile-sub-title.caption {{worker.work}}
            v-btn.hidden-xs-only(icon, @click.stop="editworker(worker)")
              v-icon edit
            v-btn.hidden-xs-only(icon, @click.native="deleteworker(worker)")
              v-icon delete
            div.hidden-sm-and-up
              v-menu(bottom left)
                v-btn(icon slot="activator")
                  v-icon more_vert
                v-list
                  v-list-tile(@click.native="editworker(worker)")
                    v-list-tile-avatar
                      v-icon edit
                    v-list-tile-title {{api.trans('crud.edit')}}
                  v-list-tile(@click.native="deleteworker(worker)")
                    v-list-tile-avatar
                      v-icon delete
                    v-list-tile-title {{api.trans('crud.delete')}}

  v-dialog(v-model="creator" scrollable)
    v-card
      v-card-title
        span.title {{api.trans('crud.add')}} {{api.trans('literals.worker')}}
        v-spacer
        v-btn(small icon @click="creator=false")
          v-icon close
      v-card-text.text-xs-center(style="height:300px")
        img.avatar-image(v-if="worker.image_id",:src="worker.image_url")
        v-text-field(v-model='worker.name', :label="api.trans('literals.name')" prepend-icon="person")
        v-text-field(v-model='worker.document', :label="api.trans('literals.document')" prepend-icon="card_membership")
        v-text-field(v-model='worker.phone_number', :label="api.trans('literals.phone_number')" prepend-icon="phone")
        v-text-field(v-model='worker.work', :label="api.trans('literals.work')" prepend-icon="work", :placeholder="api.trans('__.domestico')")
      v-divider
      v-card-actions
        v-btn(:disabled="!canSave()" v-if="!worker.id" flat color="primary"  @click="createWorker()") {{api.trans('crud.add')}}
        v-btn(:disabled="!canSave()" v-else flat color="primary"  @click="updateWorker(worker)") {{api.trans('crud.save')}}
        v-btn(@click="creator=false" flat color="primary") {{api.trans('crud.cancel')}}
  v-snackbar(:timeout="1500", bottom v-model="imageUploaded")
    span {{ api.trans('__.image uploaded') }}
    v-btn.pink--text(flat, @click.native="snackbar=false" icon)
      v-icon close 
</template>

<script lang="coffee">
api=require '../services/api.js'
module.exports =
  name: 'workers'
  mounted: ()->
    @getWorkers()
  data: ->
    api: api
    creator: false
    loaded:false
    imageUploaded: false
    worker:{name:'',document:'',phone_number:'',schedule_id:''}
  methods:
    canSave: ()->
      return @worker? and @worker.name?.length>1 and @worker.document?.length>1
    getWorkers: ()->
      @api.get """workers?where[residence_id]=#{@api.user.residence_id}"""
      .then (resp)=>
        console.log 'workers', resp.data
        @api.residence.workers=resp.data
        @loaded=true
      .catch console.error
    createWorker: ()->
      @worker.residence_id = @api.user.residence_id
      @api.post """workers""",@worker
      .then (resp)=>
        console.log resp.data
        # @api.residence.workers[@api.residence.workers.length]=resp.data
        @creator=false
        @worker={name:'',document:'',phone_number:'',schedule_id:''}
    editWorker: (worker)->
      @worker=worker
      @creator=true
    updateWorker: (worker)->
      @api.put """workers/#{worker.id}""",{name:worker.name,document:worker.document,phone_number:worker.phone_number,residence_id:worker.residence_id}
      .then (resp)=>
        console.log resp.data
        @worker={name:'',document:'',phone_number:'',schedule_id:''}
        @creator=false
    deleteworker: (worker)->
      if !confirm @api.trans '__.are you sure?'
        return
      @api.delete """workers/#{worker.id}"""
      .then (resp)=>
        console.log resp.data
    askFile: (worker)->
      @worker=worker
      @$refs.inputImage.click()
    fileUploaded: (evt)->
      return if !evt.target.files[0]?
      reader= new FileReader()
      reader.readAsDataURL evt.target.files[0], "UTF-8"
      reader.onload= (evt)=>
        @api.upload('worker',@worker.id,evt.target.result)
        .then (resp)=>
          console.log resp.data
          @worker.image_url = resp.data.image.url
          @worker.image_id = resp.data.image.id
          @imageUploaded=true
        .catch console.error
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus">
.avatar-image
  border-radius 50%
  height 70px
  width 70px
.avatar img.large
  height 46px !important
  width 46px !important
</style>
