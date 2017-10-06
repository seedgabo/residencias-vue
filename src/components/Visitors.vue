<template lang="jade">
v-layout(wrap)
  input(type="file" ref="inputImage" style="display:none;", @change="fileUploaded" accept="image/*")
  v-flex(xs12)
    v-card.mx-1(dense)
      v-card-title
        v-icon people
        span &nbsp; {{api.trans('literals.visitors')}}
        v-spacer
        v-btn.pink(dark fab small absolute right, @click.stop="visitor={ sex:'male'};creator=true" v-if="selecteds.length  ===  0")
          v-icon add
        v-btn(color="primary" v-else, @click.stop="visit=true")
          v-icon(dark) add_circle
          span {{ api.trans('crud.add') }} {{api.trans('literals.visit')}} {{ api.trans('literals.multiple') }}
      v-card-text
        v-list(dense two-line)
          v-list-tile(v-for="visitor in api.residence.visitors", :key="visitor.id", avatar="", v-on:click="clickVisitor(visitor)" xv-bind:class="selected==visitor.id?'primary':''")
            v-list-tile-action
              v-checkbox(v-model="visitor.selected", @click.stop="clickVisitor(visitor)")
            v-list-tile-avatar(@click="askFile(visitor)")
              img.large(v-if="visitor.image_id", :src="visitor.image_url")
              v-icon.primary.white--text(v-else) add_a_photo
            v-list-tile-content
              v-list-tile-title.body-2 {{visitor.name}}
              v-list-tile-sub-title.caption {{visitor.document}}
            v-btn.hidden-xs-only(icon, @click.stop.native="editVisitor(visitor)")
              v-icon edit
            v-btn.hidden-xs-only(icon, @click.stop.native="deleteVisitor(visitor)")
              v-icon delete
            div.hidden-sm-and-up
              v-menu(bottom left)
                v-btn(icon slot="activator")
                  v-icon more_vert
                v-list
                  v-list-tile(@click.stop.native="editVisitor(visitor)")
                    v-list-tile-avatar
                      v-icon edit
                    v-list-tile-title {{api.trans('crud.edit')}}
                  v-list-tile(@click.stop.native="deleteVisitor(visitor)")
                    v-list-tile-avatar
                      v-icon delete
                    v-list-tile-title {{api.trans('crud.delete')}}
  v-dialog(v-model="visit" width="400px")
    v-card
      v-card-title.primary.white--text.headline {{api.trans('crud.add')}} {{api.trans('literals.visit')}}
        v-spacer
        v-btn(icon dark, @click="visit=false"): v-icon close
      v-card-text
        v-chip(v-for="person in selecteds" key="person.id")
          v-avatar: img(:src="person.image_url")
          span {{person.name}}
         v-text-field(v-model='note', :label="api.trans('literals.notes')" prepend-icon="paragraph")
      v-card-actions
        v-spacer
        v-btn(color="primary" flat, @click="addVisit()") {{api.trans('literals.generate')}}
        v-btn(flat, @click="visit=false") {{api.trans('crud.close')}}
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
        v-btn(v-if="!visitor.id" flat color="primary"  @click="createVisitor()") {{api.trans('crud.add')}}
        v-btn(v-else flat color="primary"  @click="updateVisitor(visitor)") {{api.trans('crud.save')}}
        v-btn(@click="creator=false" flat color="primary") {{api.trans('crud.cancel')}}
  v-snackbar(:timeout="1500", bottom v-model="imageUploaded")
    span {{ api.trans('__.image uploaded') }}
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
    visit:false
    imageUploaded: false
    visitor:{ sex:'male'}
    genders: [ { text: api.trans('literals.male'), value: 'male' }, { text: api.trans('literals.female'), value: 'female' }]
    selected:null
    selecteds: []
    note: ""
  methods:
    clickVisitor: (visitor)->
      if visitor.selected
        @selecteds.splice @selecteds.indexOf(visitor),1
        @$set(visitor,'selected',false)
      else
        @selecteds.push visitor
        @$set(visitor,'selected',true)
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
    addVisit: ()->
      visitors=[]
      @selecteds.forEach (v)-> visitors.push v.id
      @api.post('visits',{user_id: @api.user.id,residence_id:@api.residence.id,visitors:visitors, visitor_id:visitors[0],note:@note})
      .then (resp)=>
        console.log resp.data
        @visit=false
        @selecteds = []
        @note=""
        @api.visitors.forEach (v)-> v.selected = false
      .catch console.erorr
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
  props:
    selectable: {type:Boolean, default:false}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
.avatar img.large
  height 46px !important
 	width 46px !important
.selected
  background: #AAA
</style>
