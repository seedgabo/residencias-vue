<template lang="jade">
v-layout(wrap)
  input(type="file" ref="inputImage" style="display:none;", @change="fileUploaded" accept="image/*")
  v-flex(xs12)
    v-card(dense)
      v-card-title
        v-icon local_parking
        span &nbsp; {{api.trans('literals.parkings')}}
      v-card-text
        v-list(dense two-line)
          v-list-tile(v-for="parking in api.residence.parkings", :key="parking.id", avatar="")
            v-list-tile-avatar(@click="askFile(parking)" v-if="parking.image_id")
              img.large(:src="parking.image_url")
            v-list-tile-content
              v-list-tile-title.body-2 {{parking.name}}
              v-list-tile-sub-title.body-1(:class="(parking.status==='available'?'green':'red')+'--text'") {{ api.trans('literals.'+parking.status)}}

  v-snackbar(:timeout="1500", bottom v-model="imageUploaded")
    span {{ api.trans('__.image uploaded') }}
    v-btn.pink--text(flat, @click.native="snackbar=false" icon)
      v-icon close
</template>

<script lang="coffee">
api=require '../services/api.js'
module.exports =
  name: 'Parkings'
  mounted:()->
    @getParkings()
  data: ->
    api: api
    creator: false
    loaded:false
    imageUploaded: false
    parking:{make:'',model:'',plate:'',color:''}
  methods:
    owners: ()->
        owners=[]
        for user in @api.residence.users
          owners[owners.length]= {value:user.id,text:user.name,avatar:user.image_url}
        owners
    canSave: ()->
      return @parking? and @parking.plate?.length>1 and @parking.make?.length>1 and @parking.model?.length>1 and @parking.color?.length>1
    getParkings: ()->
      @api.get """parkings?where[residence_id]=#{@api.user.residence_id}"""
      .then (resp)=>
        console.log 'parkings', resp.data
        @api.residence.parkings=resp.data
        @loaded=true
      .catch console.error
    createParking: ()->
      @parking.residence_id = @api.user.residence_id
      @api.post """parkings""",@parking
      .then (resp)=>
        console.log resp.data
        # @api.residence.parkings[@api.residence.parkings.length]=resp.data
        @creator=false
        @parking={make:'',model:'',plate:'',color:''}
    editParking: (parking)->
      @parking=parking
      @creator=true
    updateParking: (parking)->
      @api.put """parkings/#{parking.id}""",{make:parking.make,model:parking.model,plate:parking.plate,color:parking.color,owner_id:parking.owner_id,residence_id:parking.residence_id, visitor_id:parking.visitor_id}
      .then (resp)=>
        console.log resp.data
        @parking={make:'',model:'',plate:'',color:''}
        @creator=false
    deleteParking: (parking)->
      if !confirm @api.trans '__.are you sure?'
        return
      @api.delete """parkings/#{parking.id}"""
      .then (resp)=>
        console.log resp.data
    askFile: (parking)->
      @parking=parking
      @$refs.inputImage.click()
    fileUploaded: (evt)->
      return if !evt.target.files[0]?
      reader= new FileReader()
      reader.readAsDataURL evt.target.files[0], "UTF-8"
      reader.onload= (evt)=>
        @api.upload('parking',@parking.id,evt.target.result)
        .then (resp)=>
          console.log resp.data
          @parking.image_url = resp.data.image.url
          @parking.image_id = resp.data.image.id
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
