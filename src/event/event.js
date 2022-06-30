class JFrameEvent extends CustomEvent{
    constructor(event, configs = {}) {
        const detail = {
            ...configs,
            originEvent: configs.event,
            target: configs.target,  
        }
        super(event, {
            detail
        });
    }
}

export default JFrameEvent;