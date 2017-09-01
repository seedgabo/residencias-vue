<template lang="jade">
v-layout(wrap)
  input(type="file" ref="inputImage" style="display:none;", @change="fileUploaded" accept="image/*")
  v-flex(xs12)
    v-card(dense)
      v-card-title
        v-icon work
        span &nbsp; {{api.trans('literals.pets')}}
        v-spacer
        v-btn.pink(dark fab small absolute right, @click.stop="pet:{name:'',document:'',breed:'',specie:'',color:'',size:'',birthday:null,sex:'male'};creator=true")
          v-icon add
      v-card-text
        v-list(dense three-line)
          v-list-tile(v-for="pet in api.residence.pets", :key="pet.id", avatar="")
            v-list-tile-avatar(@click="askFile(pet)")
              img.large(v-if="pet.image_id", :src="pet.image_url")
              v-icon.primary.white--text(v-else) add_a_photo
            v-list-tile-content
              v-list-tile-title.body-2 {{pet.name}}
              v-list-tile-sub-title.caption {{pet.document}}
              v-list-tile-sub-title.caption {{pet.specie}} - {{pet.breed}}
            v-btn.hidden-xs-only(icon, @click.stop="editpet(pet)")
              v-icon edit
            v-btn.hidden-xs-only(icon, @click.native="deletepet(pet)")
              v-icon delete
            div.hidden-sm-and-up
              v-menu(bottom left)
                v-btn(icon slot="activator")
                  v-icon more_vert
                v-list
                  v-list-tile(@click.native="editpet(pet)")
                    v-list-tile-avatar
                      v-icon edit
                    v-list-tile-title {{api.trans('crud.edit')}}
                  v-list-tile(@click.native="deletepet(pet)")
                    v-list-tile-avatar
                      v-icon delete
                    v-list-tile-title {{api.trans('crud.delete')}}

  v-dialog(v-model="creator" scrollable)
    v-card
      v-card-title
        span.title {{api.trans('crud.add')}} {{api.trans('literals.pet')}}
        v-spacer
        v-btn(small icon @click="creator=false")
          v-icon close
      v-card-text.text-xs-center(style="height:300px")
        img.avatar-image(v-if="pet.image_id",:src="pet.image_url")
        v-text-field(v-model='pet.name', :label="api.trans('literals.name')" prepend-icon="person")
        v-text-field(v-model='pet.document', :label="api.trans('literals.document')" prepend-icon="card_membership")
        v-text-field(v-model='pet.phone_number', :label="api.trans('literals.phone_number')" prepend-icon="phone")
        v-text-field(v-model='pet.work', :label="api.trans('literals.work')" prepend-icon="work", :placeholder="api.trans('__.domestico')")
      v-divider
      v-card-actions
        v-btn(:disabled="!canSave()" v-if="!pet.id" flat primary @click="createpet()") {{api.trans('crud.add')}}
        v-btn(:disabled="!canSave()" v-else flat primary @click="updatepet(pet)") {{api.trans('crud.save')}}
        v-btn(@click="creator=false" flat primary) {{api.trans('crud.cancel')}}
  v-snackbar(:timeout="1500", bottom v-model="imageUploaded")
    span {{ api.trans('__.image uploaded') }}
    v-btn.pink--text(flat, @click.native="snackbar=false" icon)
      v-icon close 
</template>

<script lang="coffee">
api=require '../services/api.js'
module.exports =
  name: 'pets'
  mounted: ()->
    @getpets()
  data: ->
    api: api
    creator: false
    loaded:false
    imageUploaded: false
    pet:{name:'',document:'',breed:'',specie:'',color:'',size:'',birthday:null,sex:'male'}
  methods:
    canSave: ()->
      return @pet? and @pet.name?.length>1 and @pet.document?.length>1
    getpets: ()->
      @api.get """pets?where[residence_id]=#{@api.user.residence_id}"""
      .then (resp)=>
        console.log 'pets', resp.data
        @api.residence.pets=resp.data
        @loaded=true
      .catch console.error
    createpet: ()->
      @pet.residence_id = @api.user.residence_id
      @pet.user_id = @api.user.id
      @api.post """pets""",@pet
      .then (resp)=>
        console.log resp.data
        @api.residence.pets[@api.residence.pets.length]=resp.data
        @creator=false
        @pet={name:'',document:'',phone_number:'',schedule_id:''}
    editpet: (pet)->
      @pet=pet
      @creator=true
    updatepet: (pet)->
      @api.put """pets/#{pet.id}""",{name:pet.name,document:pet.document,phone_number:pet.phone_number,residence_id:pet.residence_id}
      .then (resp)=>
        console.log resp.data
        @pet={name:'',document:'',phone_number:'',schedule_id:''}
        @creator=false
    deletepet: (pet)->
      if !confirm @api.trans '__.are you sure?'
        return
      @api.delete """pets/#{pet.id}"""
      .then (resp)=>
        console.log resp.data
    askFile: (pet)->
      @pet=pet
      @$refs.inputImage.click()
    fileUploaded: (evt)->
      return if !evt.target.files[0]?
      reader= new FileReader()
      reader.readAsDataURL evt.target.files[0], "UTF-8"
      reader.onload= (evt)=>
        @api.upload('pet',@pet.id,evt.target.result)
        .then (resp)=>
          console.log resp.data
          @pet.image_url = resp.data.image.url
          @pet.image_id = resp.data.image.id
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
