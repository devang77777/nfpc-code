import {
    transition,
    trigger,
    query,
    style,
    animate,
    group,
    animateChild
 } from '@angular/animations';
 export const slideInAnimation =
    trigger('routeAnimations', [
         transition('Region => RegionDetails', [
              query(':enter, :leave',
                   style({ position: 'fixed',  width: '100%' }),
                   { optional: true }),
              group([
                   query(':enter', [
                       style({ transform: 'translateX(100%)' }),
                       animate('0.5s ease-in-out',
                       style({ transform: 'translateX(0%)' }))
                   ], { optional: true }),
                   query(':leave', [
                       style({ transform: 'translateX(0%)' }),
                       animate('0.5s ease-in-out',
                       style({ transform: 'translateX(-100%)' }))
                       ], { optional: true }),
               ])
         ]),
         transition('RegionDetails => Region', [
               query(':enter, :leave',
                   style({ position: 'fixed', width: '100%' }),
                   { optional: true }),
               group([
                   query(':enter', [
                       style({ transform: 'translateX(-100%)' }),
                       animate('0.5s ease-in-out',
                       style({ transform: 'translateX(0%)' }))
                   ], { optional: true }),
                   query(':leave', [
                        style({ transform: 'translateX(0%)' }),
                        animate('0.5s ease-in-out',
                        style({ transform: 'translateX(100%)' }))
                   ], { optional: true })
               ])
        ]),
        transition('Area => AreaDetails', [
            query(':enter, :leave',
                 style({ position: 'fixed',  width: '100%' }),
                 { optional: true }),
            group([
                 query(':enter', [
                     style({ transform: 'translateX(100%)' }),
                     animate('0.5s ease-in-out',
                     style({ transform: 'translateX(0%)' }))
                 ], { optional: true }),
                 query(':leave', [
                     style({ transform: 'translateX(0%)' }),
                     animate('0.5s ease-in-out',
                     style({ transform: 'translateX(-100%)' }))
                     ], { optional: true }),
             ])
       ]),
       transition('AreaDetails => Area', [
             query(':enter, :leave',
                 style({ position: 'fixed', width: '100%' }),
                 { optional: true }),
             group([
                 query(':enter', [
                     style({ transform: 'translateX(-100%)' }),
                     animate('0.5s ease-in-out',
                     style({ transform: 'translateX(0%)' }))
                 ], { optional: true }),
                 query(':leave', [
                      style({ transform: 'translateX(0%)' }),
                      animate('0.5s ease-in-out',
                      style({ transform: 'translateX(100%)' }))
                 ], { optional: true })
             ])
      ]),
      transition('Subarea => SubareaDetails', [
        query(':enter, :leave',
             style({ position: 'fixed',  width: '100%' }),
             { optional: true }),
        group([
             query(':enter', [
                 style({ transform: 'translateX(100%)' }),
                 animate('0.5s ease-in-out',
                 style({ transform: 'translateX(0%)' }))
             ], { optional: true }),
             query(':leave', [
                 style({ transform: 'translateX(0%)' }),
                 animate('0.5s ease-in-out',
                 style({ transform: 'translateX(-100%)' }))
                 ], { optional: true }),
         ])
   ]),
   transition('SubareaDetails => Subarea', [
         query(':enter, :leave',
             style({ position: 'fixed', width: '100%' }),
             { optional: true }),
         group([
             query(':enter', [
                 style({ transform: 'translateX(-100%)' }),
                 animate('0.5s ease-in-out',
                 style({ transform: 'translateX(0%)' }))
             ], { optional: true }),
             query(':leave', [
                  style({ transform: 'translateX(0%)' }),
                  animate('0.5s ease-in-out',
                  style({ transform: 'translateX(100%)' }))
             ], { optional: true })
         ])
  ]),
    transition('Major => MajorDetails', [
        query(':enter, :leave',
            style({ position: 'fixed',  width: '100%' }),
            { optional: true }),
        group([
            query(':enter', [
                style({ transform: 'translateX(100%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(0%)' }))
            ], { optional: true }),
            query(':leave', [
                style({ transform: 'translateX(0%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(-100%)' }))
                ], { optional: true }),
        ])
    ]),
    transition('MajorDetails => Major', [
        query(':enter, :leave',
            style({ position: 'fixed', width: '100%' }),
            { optional: true }),
        group([
            query(':enter', [
                style({ transform: 'translateX(-100%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(0%)' }))
            ], { optional: true }),
            query(':leave', [
                style({ transform: 'translateX(0%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(100%)' }))
            ], { optional: true })
        ])
    ]),
    transition('Sub => SubDetails', [
        query(':enter, :leave',
            style({ position: 'fixed',  width: '100%' }),
            { optional: true }),
        group([
            query(':enter', [
                style({ transform: 'translateX(100%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(0%)' }))
            ], { optional: true }),
            query(':leave', [
                style({ transform: 'translateX(0%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(-100%)' }))
                ], { optional: true }),
        ])
    ]),
    transition('SubDetails => Sub', [
        query(':enter, :leave',
            style({ position: 'fixed', width: '100%' }),
            { optional: true }),
        group([
            query(':enter', [
                style({ transform: 'translateX(-100%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(0%)' }))
            ], { optional: true }),
            query(':leave', [
                style({ transform: 'translateX(0%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(100%)' }))
            ], { optional: true })
        ])
    ]),
    transition('itemGroup => itemGroupDetails', [
        query(':enter, :leave',
            style({ position: 'fixed',  width: '100%' }),
            { optional: true }),
        group([
            query(':enter', [
                style({ transform: 'translateX(100%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(0%)' }))
            ], { optional: true }),
            query(':leave', [
                style({ transform: 'translateX(0%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(-100%)' }))
                ], { optional: true }),
        ])
    ]),
    transition('itemGroupDetails => itemGroup', [
        query(':enter, :leave',
            style({ position: 'fixed', width: '100%' }),
            { optional: true }),
        group([
            query(':enter', [
                style({ transform: 'translateX(-100%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(0%)' }))
            ], { optional: true }),
            query(':leave', [
                style({ transform: 'translateX(0%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(100%)' }))
            ], { optional: true })
        ])
    ]),
    transition('itemUoms => itemUomsDetails', [
        query(':enter, :leave',
            style({ position: 'fixed',  width: '100%' }),
            { optional: true }),
        group([
            query(':enter', [
                style({ transform: 'translateX(100%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(0%)' }))
            ], { optional: true }),
            query(':leave', [
                style({ transform: 'translateX(0%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(-100%)' }))
                ], { optional: true }),
        ])
    ]),
    transition('itemUomsDetails => itemUoms', [
        query(':enter, :leave',
            style({ position: 'fixed', width: '100%' }),
            { optional: true }),
        group([
            query(':enter', [
                style({ transform: 'translateX(-100%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(0%)' }))
            ], { optional: true }),
            query(':leave', [
                style({ transform: 'translateX(0%)' }),
                animate('0.5s ease-in-out',
                style({ transform: 'translateX(100%)' }))
            ], { optional: true })
        ])
    ]),

    transition('brand => branddetails', [
      query(':enter, :leave',
          style({ position: 'fixed', width: '100%' }),
          { optional: true }),
      group([
          query(':enter', [
              style({ transform: 'translateX(-100%)' }),
              animate('0.5s ease-in-out',
              style({ transform: 'translateX(0%)' }))
          ], { optional: true }),
          query(':leave', [
              style({ transform: 'translateX(0%)' }),
              animate('0.5s ease-in-out',
              style({ transform: 'translateX(100%)' }))
          ], { optional: true })
      ])
  ]),
  transition('branddetails => brand', [
    query(':enter, :leave',
        style({ position: 'fixed', width: '100%' }),
        { optional: true }),
    group([
        query(':enter', [
            style({ transform: 'translateX(-100%)' }),
            animate('0.5s ease-in-out',
            style({ transform: 'translateX(0%)' }))
        ], { optional: true }),
        query(':leave', [
            style({ transform: 'translateX(0%)' }),
            animate('0.5s ease-in-out',
            style({ transform: 'translateX(100%)' }))
        ], { optional: true })
    ])
]),

transition('subbrand => subbranddetails', [
  query(':enter, :leave',
      style({ position: 'fixed', width: '100%' }),
      { optional: true }),
  group([
      query(':enter', [
          style({ transform: 'translateX(-100%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(0%)' }))
      ], { optional: true }),
      query(':leave', [
          style({ transform: 'translateX(0%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(100%)' }))
      ], { optional: true })
  ])
]),
transition('subbranddetails => subbrand', [
  query(':enter, :leave',
      style({ position: 'fixed', width: '100%' }),
      { optional: true }),
  group([
      query(':enter', [
          style({ transform: 'translateX(-100%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(0%)' }))
      ], { optional: true }),
      query(':leave', [
          style({ transform: 'translateX(0%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(100%)' }))
      ], { optional: true })
  ])
]),
transition('tax => taxdetail', [
  query(':enter, :leave',
      style({ position: 'fixed', width: '100%' }),
      { optional: true }),
  group([
      query(':enter', [
          style({ transform: 'translateX(-100%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(0%)' }))
      ], { optional: true }),
      query(':leave', [
          style({ transform: 'translateX(0%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(100%)' }))
      ], { optional: true })
  ])
]),
transition('taxdetail => tax', [
  query(':enter, :leave',
      style({ position: 'fixed', width: '100%' }),
      { optional: true }),
  group([
      query(':enter', [
          style({ transform: 'translateX(-100%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(0%)' }))
      ], { optional: true }),
      query(':leave', [
          style({ transform: 'translateX(0%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(100%)' }))
      ], { optional: true })
  ])
]),
transition('bank => bankdetail', [
  query(':enter, :leave',
      style({ position: 'fixed', width: '100%' }),
      { optional: true }),
  group([
      query(':enter', [
          style({ transform: 'translateX(-100%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(0%)' }))
      ], { optional: true }),
      query(':leave', [
          style({ transform: 'translateX(0%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(100%)' }))
      ], { optional: true })
  ])
]),
transition('bankdetail => bank', [
  query(':enter, :leave',
      style({ position: 'fixed', width: '100%' }),
      { optional: true }),
  group([
      query(':enter', [
          style({ transform: 'translateX(-100%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(0%)' }))
      ], { optional: true }),
      query(':leave', [
          style({ transform: 'translateX(0%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(100%)' }))
      ], { optional: true })
  ])
]),

transition('reason => reasondetail', [
  query(':enter, :leave',
      style({ position: 'fixed', width: '100%' }),
      { optional: true }),
  group([
      query(':enter', [
          style({ transform: 'translateX(-100%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(0%)' }))
      ], { optional: true }),
      query(':leave', [
          style({ transform: 'translateX(0%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(100%)' }))
      ], { optional: true })
  ])
]),
transition('reasondetail => reason', [
  query(':enter, :leave',
      style({ position: 'fixed', width: '100%' }),
      { optional: true }),
  group([
      query(':enter', [
          style({ transform: 'translateX(-100%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(0%)' }))
      ], { optional: true }),
      query(':leave', [
          style({ transform: 'translateX(0%)' }),
          animate('0.5s ease-in-out',
          style({ transform: 'translateX(100%)' }))
      ], { optional: true })
  ])
]),

transition('routeItemGroup => routeItemGroupdetail', [
    query(':enter, :leave',
        style({ position: 'fixed', width: '100%' }),
        { optional: true }),
    group([
        query(':enter', [
            style({ transform: 'translateX(-100%)' }),
            animate('0.5s ease-in-out',
            style({ transform: 'translateX(0%)' }))
        ], { optional: true }),
        query(':leave', [
            style({ transform: 'translateX(0%)' }),
            animate('0.5s ease-in-out',
            style({ transform: 'translateX(100%)' }))
        ], { optional: true })
    ])
  ]),
  transition('routeItemGroupdetail => routeItemGroup', [
    query(':enter, :leave',
        style({ position: 'fixed', width: '100%' }),
        { optional: true }),
    group([
        query(':enter', [
            style({ transform: 'translateX(-100%)' }),
            animate('0.5s ease-in-out',
            style({ transform: 'translateX(0%)' }))
        ], { optional: true }),
        query(':leave', [
            style({ transform: 'translateX(0%)' }),
            animate('0.5s ease-in-out',
            style({ transform: 'translateX(100%)' }))
        ], { optional: true })
    ])
  ]),
 ]);
