<template lang="jade">
div
  v-carousel(v-if='sliders.length >1')
    v-carousel-item(v-for='slider in sliders', :key='slider.id', v-bind:src='slider.image.url', transition='fade', reverse-transition='fade')
      v-layout(row='', wrap='')
        v-flex(xs12='')
          h3(:style="'color:'+(slider.color?slider.color:'white')") {{slider.name}}
        v-flex(xs12='')
          p(:style="'color:'+(slider.color?slider.color:'white')") {{slider.text}}
  v-parallax.my-parallax(:src='sliders[0].image.url', v-if='sliders.length === 1', height='270')
    v-layout(column='', align-center='', justify-center='')
      h3(:style="'margin-left:15px;color:'+(slider.color?slider.color:'white')") {{sliders[0].name}}
      h5(:style="'margin-left:15px;color:'+(slider.color?slider.color:'white')") {{sliders[0].text}}
  div(style='position:relative; z-index:1')
    v-btn(fab='', absolute='', top='', left='', primary='', dark='', medium='', :to="'posts?create=true'")
      v-icon add
  v-layout.pt-3.pl-2(wrap="")
    v-flex.mt-3(xs12='', sm8='', order-xs2, order-sm1="")
      div.text-xs-center.display-1 {{api.trans('literals.posts')}}
      v-card.mx-1.text-xs-center.elevation-5
        template(v-for='post in posts')
          v-card-title.text-xs-center(:key='post.id')
            .headline.primary--text
              | {{post.title}}
          v-card-text.text-xs-justify(v-html='post.text.substring(0,100)')
          v-card-text(v-if="post.image")
            img(:src="post.image.url" style="max-width:100%; max-heigt:100px")
          v-card-text.text-xs-right
            span.headline-2.mr-4(v-if='post.user') {{post.user.name}}
            span.grey--text
              | {{ post.created_at | moment('from')}}
          v-divider
        v-card-actions
          v-btn(full='', block='', flat='', :to="'posts'")
            | {{api.trans('literals.view_resource')}} {{api.trans('literals.more')}}
    v-flex.mt-3(xs12 ="" sm4="" order-xs1="" order-sm2="", v-if="api.residence")
      v-card.mx-1.elevation-5
        v-card-text
          div.title.text-xs-center.primary--text {{api.residence.name}}
        v-card-text
          v-layout(@click="$router.push('profile')", ripple, style="cursor:pointer")
            v-flex(xs1)
              v-icon.primary--text person
            v-flex(xs5)
              b &nbsp;&nbsp;{{api.trans('literals.owner')}}:
            v-flex.text-xs-right(xs6)
              span(v-if="api.residence.owner") {{ api.residence.owner.name }}
              span(v-else) --
          v-layout.mt-3(@click="$router.push('profile')", ripple, style="cursor:pointer")
            v-flex(xs1)
              v-icon.large.warning--text fa-bar-chart
            v-flex(xs5)
              b &nbsp;&nbsp;{{api.trans('literals.status')}}:
            v-flex.text-xs-right(xs6)
              span {{api.trans('literals.'+api.residence.status)}}
          v-layout.mt-3(@click="$router.push('invoices')", ripple, style="cursor:pointer")
            v-flex(xs1)
              v-icon.large.green--text fa-money
            v-flex(xs5)
              b &nbsp;&nbsp;{{api.trans('literals.debt')}}:
            v-flex.text-xs-right(xs6)
              span {{api.residence.debt | currency }}
      v-card.elevation-5.mt-3
        div.text-xs-center.primary--text.title.pt-4
          v-icon.secondary--text event
          span  {{api.trans('__.next events')}}
        v-card-text
          v-list(three-line="")
            v-list-tile.event-item(v-for="event in next_events", :key="event.id", :style="'border-color:'+event.color",@click="$router.push('events?event_id='+event.id)")
              v-list-tile-content
                v-list-tile-title {{event.title}}
                v-list-tile-sub-title {{api.trans('__.'+ event.type)}} -
                  span  {{api.trans('__.'+event.visibility)}}
              v-list-tile-action
                v-list-tile-action-text {{event.start | moment('calendar')}} -
                  span(v-if="event.end") {{event.end | moment('from', event.start,true)}}
                  span(v-else) {{api.trans('literals.all_day')}}



</template>

<script>
const axios = require('axios')
export default {
  name: 'hello',
  mounted() {
    this.api.ready
      .then(() => {
        this.getSliders();
        this.getPosts();
        this.getEvents();
        // this.getSolventsGraph();
      });
  },
  data() {
    return {
      sliders: [],
      posts: [],
      next_events: [],
      data: { solvents: 0, defaults: 0 },
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
    },
    getEvents: function() {
      this.api.get("events?scope[soon]'")
        .then((response) => {
          console.log(response.data)
          this.next_events = response.data
        })
        .catch(console.error)
    },
    getSolventsGraph: function() {
      this.api.get("residences")
        .then((resp) => {
          var defaulters = 0, solvents = 0;
          resp.data.forEach((res) => {
            if (res.status == 'solvent')
              solvents++;
            else
              defaulters++;
          });
          console.log("solventes:", solvents);
          console.log("morosos:", defaulters);
          this.data.solvents = solvents
          this.data.defaulters = defaulters
        })
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

.event-item {
  border-left: 7px solid;
}
</style>
