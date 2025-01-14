const RingSocketDevice = require('./base-socket-device')

class Siren extends RingSocketDevice {
    constructor(deviceInfo) {
        super(deviceInfo)
        this.deviceData.mdl = 'Siren'
        
        this.entity.siren = {
            component: 'switch',
            icon: 'mdi:alarm-light',
            isLegacyEntity: true  // Legacy compatibility
        }
    }

    publishData(data) {
        const isPublish = data === undefined ? true : false
        if (isPublish) {
            // Eventually remove this but for now this attempts to delete the old siren binary_sensor
            this.publishMqtt('homeassistant/binary_sensor/'+this.locationId+'/'+this.deviceId+'_siren/config', '', false)
        }

        const sirenState = this.device.data.sirenStatus === 'active' ? 'ON' : 'OFF'
        this.publishMqtt(this.entity.siren.state_topic, sirenState)
        this.publishAttributes()
    }

    // Process messages from MQTT command topic
    processCommand(message, componentCommand) {
        switch (componentCommand) {
            case 'siren/command':
                this.setSirenState(message)
                break;
            default:
                this.debug(`Received message to unknown command topic: ${componentCommand}`)
        }
    }

    setSirenState(message) {
        const command = message.toLowerCase()
        switch(command) {
            case 'on':
            case 'off':
                this.debug(`Received set siren state ${message}`)
                this.device.setInfo({ device: { v1: { on: (command === 'on') ? true : false } } })
                break;
            default:
                this.debug('Received invalid siren state command')
        }
    }
}

module.exports = Siren