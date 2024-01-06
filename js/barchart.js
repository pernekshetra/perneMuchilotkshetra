/* Chart Data related to high Chart is defined here 
Community Marriage Chart
*/




$(function() {
    $('#communityMarraigeChart').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Number of Marriages'
        },
        subtitle: {
            text: 'Last 10 years data'
        },
        xAxis: {
            categories: [
            '2018',
            '2017',
            '2016',
                '2015',
                '2014',
                '2013',
                '2012',
                '2011',
                '2010',
                '2009',
                '2008',
            ],
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total Marriages (Integer)'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.0f}marriages </b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Pooram',
            data: [29,31,21,23,40, 40, 66, 47, 40, 49, 37,]

        }, {
            name: 'Udayastamanam',
            data: [0,16,22,40, 27, 39, 37, 35, 40, 27, 26,]

        }]
    });
});


