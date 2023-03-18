const { Extension, log, INPUT_METHOD, PLATFORMS } = require('deckboard-kit');
const { Query } = require('node-wmi');

const CATEGORIZATION = {
    load: {
        'Memory': 'ram',
        'CPU Total': 'cpu',
        'GPU Core': 'gpu',
        'Used Space': 'hdd'
    },
    temperature: {
        'CPU Package': 'cpu',
        'GPU Core': 'gpu',
        'Temperature': 'hdd'
    },
    data: { // SensorType
        'Used Memory': 'used', // Name: Key
        'Available Memory': 'avail'
    }
}

const SUFFIX = { // Related to SensorType
    load: '%',
    temperature: '°C',
    data: 'GB'
}

const DEFAULT_VALUE = { // hw-SensorType-Key
    'hw-load-cpu': '-%',
    'hw-load-gpu': '-%',
    'hw-load-ram': '-%',
    'hw-load-hdd': '-%',
    'hw-temperature-cpu': '-°C',
    'hw-temperature-gpu': '-°C',
    'hw-temperature-hdd': '-°C',
    'hw-data-used': '?GB',
    'hw-data-avail': '?GB'
}

class OpenHardwareMonitor extends Extension {
    constructor(props) {
        super(props);
        this.setValue = props.setValue;
        this.name = 'Hardware Monitor';
        this.platforms = [PLATFORMS.WINDOWS];

        this.inputs = [
            {
                label: 'Display CPU Stats',
                value: 'hw-cpu',
                icon: 'headphones',
                mode: 'custom-value',
                fontIcon: 'fas',
                color: '#8E44AD',
                input: [
                    {
                        label: 'Select monitor',
                        type: INPUT_METHOD.INPUT_SELECT,
                        items: [
                            { value: 'hw-load-cpu', label: 'CPU Load' },
                            { value: 'hw-temperature-cpu', label: 'CPU Temperature' }
                        ]
                    }
                ]
            },
            {
                label: 'Display GPU Stats',
                value: 'hw-gpu',
                icon: 'headphones',
                mode: 'custom-value',
                fontIcon: 'fas',
                color: '#8E44AD',
                input: [
                    {
                        label: 'Select monitor',
                        type: INPUT_METHOD.INPUT_SELECT,
                        items: [
                            { value: 'hw-load-gpu', label: 'GPU Load' },
                            { value: 'hw-temperature-gpu', label: 'GPU Temperature' }
                        ]
                    }
                ]
            },
            {
                label: 'Display RAM Stats',
                value: 'hw-ram',
                icon: 'headphones',
                mode: 'custom-value',
                fontIcon: 'fas',
                color: '#8E44AD',
                input: [
                    {
                        label: 'Select monitor',
                        type: INPUT_METHOD.INPUT_SELECT,
                        items: [
                            { value: 'hw-load-ram', label: 'RAM Load' },
                            { value: 'hw-data-ram', label: 'RAM Used GB' }, // value as in DEFAULT_VALUE
                            { value: 'hw-data-avail', label: 'RAM Available GB' }
                        ]
                    }
                ]
            },
            {
                label: 'Display HDD Stats',
                value: 'hw-hdd',
                icon: 'headphones',
                mode: 'custom-value',
                fontIcon: 'fas',
                color: '#8E44AD',
                input: [
                    {
                        label: 'Select monitor',
                        type: INPUT_METHOD.INPUT_SELECT,
                        items: [
                            { value: 'hw-load-hdd', label: 'HDD Load' },
                            { value: 'hw-temperature-hdd', label: 'HDD Temperature' }
                        ]
                    }
                ]
            }
        ];
        this.configs = [];
    }

    // Executes when the extensions loaded every time the app start.
    initExtension() {
        if (process.platform === 'win32')
            setInterval(() => {
                Query()
                    .namespace('root/OpenHardwareMonitor')
                    .class('Sensor')
                    .where("SensorType='Load' OR SensorType='Temperature' OR SensorType='Data'") // All SensorTypes
                    .exec((err, data) => {
                        if (err || !data)
                            this.setValue(DEFAULT_VALUE)
                        else this.setValue(data
                            .filter(({ Name, SensorType }) => CATEGORIZATION[SensorType.toLowerCase()][Name] !== undefined)
                            .map(({ Name, Value, SensorType }) => ({
                                key: 'hw-' + SensorType.toLowerCase() + '-' + CATEGORIZATION[SensorType.toLowerCase()][Name],
                                value: Math.round(Value) + SUFFIX[SensorType.toLowerCase()]
                            }))
                            .reduce((data, { key, value }) => ({ ...data, [key]: value }), DEFAULT_VALUE)
                        )
                    })
            }, 2000)
        else this.setValue(DEFAULT_VALUE)
    }

    execute(action, args) {
        return;
    };
}

module.exports = (sendData) => new OpenHardwareMonitor(sendData);
