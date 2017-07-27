<template lang="jade">
v-layout(wrap)
  input(type="file" ref="inputImage" style="display:none;", @change="fileUploaded" accept="image/*")
  v-flex(xs12)
    v-card(dense)
      v-card-title
        v-icon people
        span &nbsp; {{api.trans('literals.visitors')}}
        v-spacer
        v-btn.pink(dark fab small absolute right, @click.stop="visitor={ sex:'male'};creator=true")
          v-icon add
      v-card-text
        v-list(dense two-line)
          v-list-tile(v-for="visitor in api.residence.visitors", :key="visitor.id", avatar="")
            v-list-tile-avatar(@click="askFile(visitor)")
              img.large(v-if="visitor.image_id", :src="visitor.image_url")
              v-icon.primary.white--text(v-else) add_a_photo
            v-list-tile-content
              v-list-tile-title {{visitor.name}}
            v-btn.hidden-xs-only(icon, @click.stop="editVisitor(visitor)")
              v-icon edit
            v-btn.hidden-xs-only(icon, @click.native="deleteVisitor(visitor)")
              v-icon delete
            div.hidden-sm-and-up
              v-menu(bottom left)
                v-btn(icon slot="activator")
                  v-icon more_vert
                v-list
                  v-list-tile(@click.native="editVisitor(visitor)")
                    v-list-tile-avatar
                      v-icon edit
                    v-list-tile-title {{api.trans('crud.edit')}}
                  v-list-tile(@click.native="deleteVisitor(visitor)")
                    v-list-tile-avatar
                      v-icon delete
                    v-list-tile-title {{api.trans('crud.delete')}}

  v-dialog(v-model="creator")
    v-card
      v-card-title
        span.title {{api.trans('crud.add')}} {{api.trans('literals.visitor')}}
        v-spacer
        v-btn(small icon @click="creator=false")
          v-icon close
      v-card-text.text-xs-center
        img.avatar-image(v-if="visitor.image_url",:src="api.url+'images/'+visitor.image_id+'/encode'")
        v-text-field(v-model='visitor.name', :label="api.trans('literals.name')" prepend-icon="person")
        v-text-field(v-model='visitor.document', :label="api.trans('literals.document')" prepend-icon="card_membership")
        v-select(prepend-icon="wc" v-model="visitor.sex",:items="genders",:label="api.trans('literals.sex')")
        //- v-text-field(v-model='visitor.phone_number', :label="api.trans('literals.phone_number')" prepend-icon="phone")
      v-divider
      v-card-actions
        v-btn(v-if="!visitor.id" flat primary @click="createVisitor()") {{api.trans('crud.add')}}
        v-btn(v-else flat primary @click="updateVisitor(visitor)") {{api.trans('crud.save')}}
        v-btn(@click="creator=false" flat primary) {{api.trans('crud.cancel')}}
  v-snackbar(:timeout="1500", bottom v-model="imageUploaded")
    {{ api.trans('__.image uploaded') }}
    v-btn.pink--text(flat, @click.native="snackbar=false" icon)
      v-icon close 
</template>

<script lang="coffee">
api=require '../services/api.js'
module.exports =
  name: 'Visitors'
  mounted: ()->
    @getVisitors()
  data: ->
    api: api
    creator: false
    loaded:false
    imageUploaded: false
    visitor:{ sex:'male'}
    genders: [ { text: api.trans('literals.male'), value: 'male' }, { text: api.trans('literals.female'), value: 'female' }]
  methods:
    getVisitors: ()->
      @api.get """visitors?where[residence_id]=#{api.user.residence_id}"""
      .then (resp)=>
        console.log 'visitors', resp.data
        @api.residence.visitors=resp.data
        @loaded=true
      .catch console.error
    createVisitor: ()->
      @visitor.residence_id = @api.user.residence_id
      @api.post """visitors""",@visitor
      .then (resp)=>
        console.log resp.data
        @creator=false
        @visitor={sex:'male'}
    editVisitor: (visitor)->
      @visitor=visitor
      @creator=true
    updateVisitor: (visitor)->
      @api.put """visitors/#{visitor.id}""",{name:visitor.name, sex:visitor.sex,document:visitor.document, residence_id:visitor.residence_id}
      .then (resp)=>
        console.log resp.data
        @visitor={sex:'male'}
        @creator=false
    deleteVisitor: (visitor)->
      if !confirm @api.trans '__.are you sure?'
        return
      @api.delete """visitors/#{visitor.id}"""
      .then (resp)=>
        console.log resp.data
    askFile: (visitor)->
      @visitor=visitor
      @$refs.inputImage.click()
    fileUploaded: (evt)->
      return if !evt.target.files[0]?
      reader= new FileReader()
      reader.readAsDataURL evt.target.files[0], "UTF-8"
      reader.onload= (evt)=>
        @api.upload('visitor',@visitor.id,evt.target.result)
        .then (resp)=>
          console.log resp.data
          @visitor.image_url = resp.data.image.url
          @visitor.image_id = resp.data.image.id
          @imageUploaded=true
        .catch console.error
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus">
</style>
