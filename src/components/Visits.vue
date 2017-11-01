<template lang="jade">
div
  v-card.mx-1
    v-toolbar.primary(dark)
      v-icon.white--text list
      v-toolbar-title {{api.trans('literals.visits')}}
      v-spacer
      v-btn(outline v-if="adder", @click.stop="adding=true")
        v-icon add
        span {{ api.trans('crud.add') }}
    v-card-text
      v-list(two-line)
        v-list-tile(v-for="visit in visitsFilter", :key="visit.id" avatar v-if="visit.visitor")
          v-list-tile-avatar(v-if="visit.visitor && visit.visitor.image")
            img(:src="visit.visitor.image.url")
          v-list-tile-content(@click.stop="visitDetails(visit)")
            v-list-tile-title(v-if="visit.visitor") {{visit.visitor.name}}
              span(v-if="visit.visitors && visit.visitors.length>1")  {{api.trans('__.and others')}} {{visit.visitors.length-1}}
            v-list-tile-sub-title {{visit.created_at | moment('from')}}
            v-list-tile-sub-title(v-if="visit.user") {{ visit.user.name }}
          v-list-tile-action(:class="(visit.status==='approved'? 'green':'red') +'--text'")
            small {{api.trans('literals.'+visit.status)}}
  v-dialog(v-model="adding" width="400px")
    v-card
      v-toolbar(flat dark)
        v-toolbar-title {{api.trans('crud.add')}} {{api.trans('literals.visit')}}
        v-spacer
        v-btn(icon): v-icon close
      v-card-text
        v-layout
          v-flex
            v-select(v-bind:items="api.residence.visitors" v-model="visit.visitor_id", :label="api.trans('literals.visitor')" single-line bottom item-text="name" item-value="id" prepend-icon="person")
            v-text-field(v-model='visit.note', :label="api.trans('literals.notes')" prepend-icon="textsms")
      v-card-actions
        v-spacer
        v-btn(flat color="primary", :disabled="!canAddVisit()", @click="addVisit()") {{api.trans('crud.add')}}
        v-btn(flat, @click="adding=false") {{api.trans('crud.cancel')}}
  v-dialog(v-model="see_visit" width="500px")
    v-card
      v-toolbar.primary(flat dark)
        v-toolbar-title {{api.trans('literals.visit')}}
          span(v-if="selected.visitor && selected.visitors.length < 2")  {{selected.visitor.name}}
        v-spacer
        v-btn(icon, @click="see_visit=false"): v-icon close
      v-card-text.text-xs-center
        template(v-if="selected.visitor && selected.visitors.length < 2")
          img.avatar.medium(:src="selected.visitor.image.url" v-if="selected.visitor && selected.visitor.image" style="margin: 0 auto")
          p(v-if="selected.visitor")
            b {{api.trans('literals.visitor')}}:
            span  {{selected.visitor.name}}
            br
            small {{selected.visitor.document}}
        template(v-else)
          v-chip(v-for="person in selected.visitors" key="person.id")
            v-avatar: img(:src="person.image_url")
            span {{person.name}}
            v-menu(v-if="person.pivot")
              v-btn(flat small round slot="activator")
                small {{api.trans('literals.'+person.pivot.status)}}
                v-icon(small) arrow_drop_down
              v-list
                v-list-tile(:disabled="person.pivot.status === 'approved'" ,@click="person.pivot.status = 'approved'")
                  v-list-tile-title {{api.trans('literals.approved')}}
                v-list-tile(:disabled="person.pivot.status === 'rejected'" ,@click="person.pivot.status = 'rejected'")
                  v-list-tile-title {{api.trans('literals.rejected')}}
                v-list-tile(:disabled="person.pivot.status === 'waiting for confirmation'" ,@click="person.pivot.status = 'waiting for confirmation'")
                  v-list-tile-title {{api.trans('literals.waiting for confirmation')}}
        p(v-if="selected.note")
          b {{api.trans('literals.notes')}}:
          span  {{selected.note}}
        p(v-if="selected.user")
          b {{api.trans('literals.user')}}
          span  {{selected.user.name}}
        p(v-if="selected.vehicle")
          b {{api.trans('literals.vehicle')}}
          span  {{selected.vehicle.name}}
        p(v-if="selected.parking")
          b {{api.trans('literals.parking')}}
          span  {{selected.parking.name}}
        p.text-capitalize
          b {{api.trans('literals.arrive')}}:
          span  {{selected.created_at | moment('LLLL') }}
        p.text-capitalize(v-if="selected.departured_at")
          b {{api.trans('literals.departured')}}
          span  {{ selected.departured_at | moment('LLLL') }}
        div()
          v-select(:items="statuses", v-model="selected.status", :label="api.trans('literals.status')", prepend-icon="transfer_within_a_station")
          div.text-xs-right
            v-btn(@click="updateVisit(selected,selected.status)" flat color="primary") {{api.trans('crud.save')}}
</template>

<script lang="coffee">
api=require '../services/api.js'
module.exports =
  name: 'Visits'
  mounted: ()->
    console.log @api
    @getData()
    @$router.app.$on 'visitCreated',(data)=>
      @getData()
    @$router.app.$on 'visitChanged',(data)=>
      @getData()
    @$router.app.$on 'visitDeleted',(data)=>
      @getData()
  beforeDestroy: ->
    @$router.app.$off('visitCreated')
    @$router.app.$off('visitCreated')
    @$router.app.$off('visitCreated')
  data: ->
    api: api
    visits:[]
    visit:{visitor_id:null,residence_id:api.residence.id,status:'approved',note:""}
    adding:false
    see_visit:false
    selected:{}
    statuses: [{value:'rejected',text: api.trans('literals.rejected')},{value:'approved',text: api.trans('literals.approved')},{value:'waiting for confirmation',text:api.trans('literals.waiting for confirmation'), disabled:true}]
  methods:
    visitDetails:(visit)->
      @selected=visit
      @see_visit=true
    getData:()->
      @api.get 'visits?with[]=user&with[]=vehicle&with[]=visitor&with[]=visitors&where[residence_id]='+@api.user.residence_id+"limit=500&order[created_at]=desc"
      .then (resp)=>
        # console.log 'data', resp.data
        @api.visits=resp.data
      .catch console.error
    addVisit:()->
      @api.post('visits',@visit)
      .then (resp)=>
        # @visits= [resp.data].concat @visits
        @adding=false
        @visit={visitor_id:null,residence_id:api.residence.id,status:'approved',note:""}
      .catch console.error
    canAddVisit: ()->
      @visit.visitor_id>0
    updateVisit:(visit,status)->
      @api.put('visits/'+visit.id,{status:status,visitors:@prepareVisitors(visit)})
      .then (resp)=>
        console.log resp.data
        visit.status = resp.data.status
        @$set(visit,'status',resp.data.status)
        @see_visit=false
      .catch console.error
    prepareVisitors:(visit)->
        obj = {}
        for person in visit.visitors
          obj[person.id] = {status: person.pivot.status}
        return obj

  computed:
    visitsFilter:()->
      if @filters.visitor==null
        return @api.visits
      return @api.visits.filter (v)=>
        return v.visitor?.id==@filters.visitor.id
  props:
    filters:
      default:()->{visitor:null}
    adder:
      type:Boolean
      default:true
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
</style>
