import ipywidgets as widgets
import numpy as np
from traitlets import Unicode, Int, Bool, Bytes
from io import BytesIO

# See js/lib/example.js for the frontend counterpart to this file.
def array_to_list(array):
    if isinstance(pos, np.ndarray):
        return pos.tolist()
    else:
        return pos


@widgets.register
class Vis3D(widgets.DOMWidget):
    """An example widget."""

    # Name of the widget view class in front-end
    _view_name = Unicode('VisView').tag(sync=True)

    # Name of the widget model class in front-end
    _model_name = Unicode('VisModel').tag(sync=True)

    # Name of the front-end module containing widget view
    _view_module = Unicode('jupyter-vis3d').tag(sync=True)

    # Name of the front-end module containing widget model
    _model_module = Unicode('jupyter-vis3d').tag(sync=True)

    # Version of the front-end module containing widget view
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    # Widget specific property.
    # Widget properties are defined as traitlets. Any property tagged with `sync=True`
    # is automatically synced to the frontend *any* time it changes in Python.
    # It is synced back to Python from the frontend *any* time the model is touched.
    bg_color = Unicode("#000000").tag(sync=True)

    height = Int(600).tag(sync=True)

    color = Int(0x00ff00).tag(sync=True)

    enable_stats = Bool(True).tag(sync=True)

    volume_bytes = Bytes().tag(sync=True)

    volume_data = np.array([])

    def __init__(self, **kwargs):
        super().__init__()
        for key, value in kwargs.items():
            setattr(self, key, value)
        self.volume_to_bytes()

    def volume_to_bytes(self):
        iobyte = BytesIO()
        np.save(iobyte,self.volume_data)
        self.volume_bytes = iobyte.getvalue()

    def set_volume_data(self, data):
        self.volume_data = data
        self.volume_to_bytes()

    def draw_sphere(self, **kwargs):
        message = {}
        message['type'] = "sphere"
        message['pos'] = array_to_list(kwargs['pos']) if 'pos' in kwargs else [0, 0, 0]
        message['radius'] = kwargs['radius'] if 'radius' in kwargs else 1
        message['color'] = kwargs['color'] if 'color' in kwargs else "#aaaaaa"
        self.send(message)

    def draw_cube(self, **kwargs):
        message = {}
        message['type'] = "cube"
        message['pos'] = array_to_list(kwargs['pos']) if 'pos' in kwargs else [0, 0, 0]
        message['size'] = kwargs['size'] if 'size' in kwargs else 1
        message['color'] = kwargs['color'] if 'color' in kwargs else "#aaaaaa"
        self.send(message)
