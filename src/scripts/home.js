import Vue from 'vue/dist/vue.common';
if (document.querySelector('[divyanshu]')) {
  new Vue({
    delimiters: ['${', '}'],
    el: '[divyanshu]',
    name:  'divyanshu',
    data(){
      return{
        message: 'here we are'
      }
    },
    computed:{},
    methods:{},
    watch:{},
    created(){
      console.log('created');
    },
    mounted(){
      console.log('mounted')
    }
  })
  
}