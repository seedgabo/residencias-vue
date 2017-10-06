<template lang="jade">
v-layout(wrap)
  input(type="file" ref="inputImage" style="display:none;", @change="fileUploaded" accept="image/*")
  v-flex(xs12)
    v-card(dense)
      v-card-title
        v-icon directions_car
        span &nbsp; {{api.trans('literals.vehicles')}}
        v-spacer
        v-btn.pink(dark fab small absolute right, @click.stop="vehicle={make:'',model:'',plate:'',color:''};creator=true")
          v-icon add
      v-card-text
        v-list(dense two-line)
          v-list-tile(v-for="vehicle in api.residence.vehicles", :key="vehicle.id", avatar="")
            v-list-tile-avatar(@click="askFile(vehicle)")
              img.large(v-if="vehicle.image_id", :src="vehicle.image_url")
              v-icon.primary.white--text(v-else) add_a_photo
            v-list-tile-content
              v-list-tile-title.body-2 {{vehicle.name}}
              v-list-tile-sub-title.caption {{vehicle.document}}
            v-btn.hidden-xs-only(icon, @click.stop="editVehicle(vehicle)")
              v-icon edit
            v-btn.hidden-xs-only(icon, @click.native="deleteVehicle(vehicle)")
              v-icon delete
            div.hidden-sm-and-up
              v-menu(bottom left)
                v-btn(icon slot="activator")
                  v-icon more_vert
                v-list
                  v-list-tile(@click.native="editVehicle(vehicle)")
                    v-list-tile-avatar
                      v-icon edit
                    v-list-tile-title {{api.trans('crud.edit')}}
                  v-list-tile(@click.native="deleteVehicle(vehicle)")
                    v-list-tile-avatar
                      v-icon delete
                    v-list-tile-title {{api.trans('crud.delete')}}

  v-dialog(v-model="creator" scrollable)
    v-card
      v-card-title
        span.title {{api.trans('crud.add')}} {{api.trans('literals.vehicle')}}
        v-spacer
        v-btn(small icon @click="creator=false")
          v-icon close
      v-card-text.text-xs-center(style="height:300px")
        img.avatar-image(v-if="vehicle.image_id",:src="vehicle.image_url")
        v-text-field(v-model='vehicle.make', :label="api.trans('literals.make')" prepend-icon="directions_car")
        v-text-field(v-model='vehicle.model', :label="api.trans('literals.model')" prepend-icon="chrome_reader_mode")
        v-text-field(v-model='vehicle.plate', :label="api.trans('literals.plate')" prepend-icon="wb_iridescent")
        v-text-field(v-model='vehicle.color', :label="api.trans('literals.color')" prepend-icon="color_lens")
        v-select(v-model='vehicle.owner_id', :label="api.trans('literals.owner')" prepend-icon="person", :items="owners()" autocomplete)
          template(slot="item" scope="data")
            v-list-tile(close avatar)
              v-avatar
                img(:src="data.item.avatar")
              v-list-tile-content
                v-list-tile-title {{data.item.text}}
        //- v-text-field(v-model='visitor.phone_number', :label="api.trans('literals.phone_number')" prepend-icon="phone")
      v-divider
      v-card-actions
        v-btn(:disabled="!canSave()" v-if="!vehicle.id" flat color="primary"  @click="createVehicle()") {{api.trans('crud.add')}}
        v-btn(:disabled="!canSave()" v-else flat color="primary"  @click="updateVehicle(vehicle)") {{api.trans('crud.save')}}
        v-btn(@click="creator=false" flat color="primary") {{api.trans('crud.cancel')}}
  v-snackbar(:timeout="1500", bottom v-model="imageUploaded")
    span {{ api.trans('__.image uploaded') }}
    v-btn.pink--text(flat, @click.native="snackbar=false" icon)
      v-icon close 
</template>

<script lang="coffee">
api=require '../services/api.js'
module.exports =
  name: 'Vehicles'
  mounted: ()->
    @getVehicles()
  data: ->
    api: api
    creator: false
    loaded:false
    imageUploaded: false
    vehicle:{make:'',model:'',plate:'',color:''}
  methods:
    owners: ()->
        owners=[]
        for user in @api.residence.users
          owners[owners.length]= {value:user.id,text:user.name,avatar:user.image_url}
        owners
    canSave: ()->
      return @vehicle? and @vehicle.plate?.length>1 and @vehicle.make?.length>1 and @vehicle.model?.length>1 and @vehicle.color?.length>1
    getVehicles: ()->
      @api.get """vehicles?where[residence_id]=#{@api.user.residence_id}"""
      .then (resp)=>
        console.log 'vehicles', resp.data
        @api.residence.vehicles=resp.data
        @loaded=true
      .catch console.error
    createVehicle: ()->
      @vehicle.residence_id = @api.user.residence_id
      @api.post """vehicles""",@vehicle
      .then (resp)=>
        console.log resp.data
        # @api.residence.vehicles[@api.residence.vehicles.length]=resp.data
        @creator=false
        @vehicle={make:'',model:'',plate:'',color:''}
    editVehicle: (vehicle)->
      @vehicle=vehicle
      @creator=true
    updateVehicle: (vehicle)->
      @api.put """vehicles/#{vehicle.id}""",{make:vehicle.make,model:vehicle.model,plate:vehicle.plate,color:vehicle.color,owner_id:vehicle.owner_id,residence_id:vehicle.residence_id, visitor_id:vehicle.visitor_id}
      .then (resp)=>
        console.log resp.data
        @vehicle={make:'',model:'',plate:'',color:''}
        @creator=false
    deleteVehicle: (vehicle)->
      if !confirm @api.trans '__.are you sure?'
        return
      @api.delete """vehicles/#{vehicle.id}"""
      .then (resp)=>
        console.log resp.data
    askFile: (vehicle)->
      @vehicle=vehicle
      @$refs.inputImage.click()
    fileUploaded: (evt)->
      return if !evt.target.files[0]?
      reader= new FileReader()
      reader.readAsDataURL evt.target.files[0], "UTF-8"
      reader.onload= (evt)=>
        @api.upload('vehicle',@vehicle.id,evt.target.result)
        .then (resp)=>
          console.log resp.data
          @vehicle.image_url = resp.data.image.url
          @vehicle.image_id = resp.data.image.id
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
