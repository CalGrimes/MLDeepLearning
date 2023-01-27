from unittest import mock
import pprint
import json
import os
import tempfile
from contextlib import contextmanager
import xml.etree.ElementTree as ET

from PIL import Image
import xmltodict
from webtest import TestApp as testapp
from renom_tag import server, Task


def build_img_dir(tmpdir, folder):
    imgdir = tmpdir.join(server.DIR_ROOT, folder, server.IMG_DIR)
    os.makedirs(imgdir.strpath)
    return imgdir


def build_xml_dir(tmpdir, folder):
    xmldir = tmpdir.join(server.DIR_ROOT, folder, str(server.LABEL_DETECTION))
    os.makedirs(xmldir.strpath)
    return xmldir


def create_xml_data():
    annotation = ET.Element('annotation')
    path = ET.SubElement(annotation, 'path')
    source = ET.SubElement(annotation, 'source')
    size = ET.SubElement(annotation, 'size')
    segments = ET.SubElement(annotation, 'segments')
    object = ET.SubElement(annotation, 'object')
    folder = ET.SubElement(annotation, 'folder')
    filename = ET.SubElement(annotation, 'filename')

    database = ET.SubElement(source, 'database')
    reviewresult = ET.SubElement(source, 'reviewresult')
    reviewcomment = ET.SubElement(source, 'reviewcomment')

    width = ET.SubElement(size, 'width')
    height = ET.SubElement(size, 'height')
    depth = ET.SubElement(size, 'depth')

    name = ET.SubElement(object, 'name')
    pose = ET.SubElement(object, 'pose')
    truncated = ET.SubElement(object, 'truncated')
    difficult = ET.SubElement(object, 'difficult')
    bndbox = ET.SubElement(object, 'bndbox')

    xmin = ET.SubElement(bndbox, 'xmin')
    xmax = ET.SubElement(bndbox, 'xmax')
    ymin = ET.SubElement(bndbox, 'ymin')
    ymax = ET.SubElement(bndbox, 'ymax')

    path.text = 'a.jpeg'
    database.text = 'Unknown'
    width.text = '275'
    height.text = '183'
    depth.text = '3'
    segments.text = '0'
    name.text = 'car'
    pose.text = 'Unspecified'
    truncated.text = '0'
    difficult.text = '0'
    xmin.text = '26'
    xmax.text = '247'
    ymin.text = '27'
    ymax.text = '162'
    folder.text = 'dataset'
    filename.text = 'a.jpeg'

    ex_xml = ET.tostring(annotation)
    return ex_xml


# not sure
def test_get_raw_img(tmpdir):
    with tmpdir.as_cwd():
        imgdir = build_img_dir(tmpdir, 'folderx')

        im = Image.new("RGB", (512, 512))
        im.save(imgdir.join('a.png').strpath, 'PNG')

        app = testapp(server.app)
        ret = app.get('/api/get_raw_img/folderx/a.png')
        assert len(ret.body) == 1164


def test_get_thumbnail(tmpdir):
    with tmpdir.as_cwd():
        imgdir = build_img_dir(tmpdir, 'folderx')

        im = Image.new("RGB", (512, 512))
        im.save(imgdir.join('a.png').strpath, 'PNG')

        app = testapp(server.app)
        ret = app.get('/t/folderx/a.png')
        assert len(ret.body) == 94


def test_save_annotation(tmpdir):
    with tmpdir.as_cwd():
        xmldir = build_xml_dir(tmpdir, 'folderx')

        json = {'task_id': Task.DETECTION.value,
                'username': 'folderx',
                'value': {'annotation':
                          {'path': 'a.jpg',
                           'source': {
                               'database': 'Unknown',
                               'comment': {
                                   'admin': '',
                                   'subord': ''
                               },
                               'reviewresult': ''
                           },
                           'size': {'width': 500, 'height': 375, 'depth': 3},
                           'segments': 0,
                           'objects': [
                               {'object':
                                {'name': 'asda', 'pose': 'Unspecified',
                                 'truncated': 0, 'difficult': 0,
                                 'bndbox':
                                 {'xmin': 10, 'xmax': 100, 'ymin': 20, 'ymax': 200
                                  }}}]}}}

        app = testapp(server.app)
        app.post_json('/api/save_annotation', json)

        xml = xmldir.join('a.xml').read_text('utf8')
        d = xmltodict.parse(xml, xml_attribs=True)

        ann = d['annotation']
        assert ann['path'] == 'a.jpg'
        assert ann['size']['width'] == '500'
        assert ann['size']['height'] == '375'
        assert ann['folder'] == 'dataset'
        assert ann['filename'] == 'a.jpg'


def test_get_filename_obj(tmpdir):
    with tmpdir.as_cwd():
        imgdir = build_img_dir(tmpdir, 'folderx')
        imgdir.join('abc.jpeg').write_binary(b'')
        imgdir.join('abc.jpg').write_binary(b'')
        imgdir.join('a-b.png').write_binary(b'')
        imgdir.join('ccc.bmp').write_binary(b'')

        xmldir = build_xml_dir(tmpdir, 'folderx')
        ex_xml = create_xml_data()
        xmldir.join('a.xml').write(ex_xml)

        app = testapp(server.app)
        ret = app.post_json('/api/get_filename_obj',
                            {
                                'task_id': Task.DETECTION.value,
                                'username': 'folderx',
                                'all': False
                            })
        #filename_list = [*ret.json['filename_list']]
        filename_obj = []
        for key in ret.json['filename_obj']:
            filename_obj.append(key)

        undef_img_list = ret.json['undef_img_list']
        dup_img_list = ret.json['dup_img_list']
        print(filename_obj)
        print(undef_img_list)
        #assert filename_list ==['ccc.bmp','a.jpeg','b.jpg']
        assert undef_img_list == ['a-b.png']
        assert dup_img_list == ['abc.jpeg']


def test_save_label_candidates_dict(tmpdir):
    with tmpdir.as_cwd():
        xmldir = build_xml_dir(tmpdir, 'folderx')

        app = testapp(server.app)
        app.post_json('/api/save_label_candidates_dict',
                      {
                          'task_id': Task.DETECTION.value,
                          'username': 'folderx',
                          'labels': {'0': {'id': 0, 'label': 'car', 'shortcut': '4'}, '1': {'id': 1, 'label': 'dhjs', 'shortcut': 'g'}}})

        jsonfile = tmpdir.join(server.DIR_ROOT, 'folderx',
                               server.SAVE_JSON_FILE_PATH)

        saved = json.load(open(jsonfile.strpath))
        assert saved == {'DETECTION': {
            '0': {'label': 'car', 'shortcut': '4'},
            '1': {'label': 'dhjs', 'shortcut': 'g'}},
            'SEGMENTATION': {}
        }


def test_load_label_candidates_dict(tmpdir):
    with tmpdir.as_cwd():
        xmldir = build_xml_dir(tmpdir, 'folderx')

        d = {"DETECTION": {'0': {'label': 'car', 'shortcut': '4'}}}
        jsonfile = tmpdir.join(server.DIR_ROOT, 'folderx',
                               server.SAVE_JSON_FILE_PATH)

        with open(jsonfile.strpath, 'w') as f:
            f.write(json.dumps(d))

        app = testapp(server.app)
        ret = app.post_json('/api/load_label_candidates_dict',
                            {
                                'username': 'folderx',
                                'task_id': Task.DETECTION.value
                            })
        assert ret.json_body == {'0': {'label': 'car', 'shortcut': '4'}}


def test_delete_annotation(tmpdir):
    with tmpdir.as_cwd():
        xmldir = build_xml_dir(tmpdir, 'folderx')
        ex_xml = create_xml_data()
        xmldir.join('target.xml').write(ex_xml)

        app = testapp(server.app)
        ret = app.post_json('/api/delete_annotation',
                            {'username': 'folderx',
                             'target_filename': 'target.png',
                             'task_id': Task.DETECTION.value
                             })

        assert ret.json_body == {'result': 121}


def test_make_dir(tmpdir):
    with tmpdir.as_cwd():

        app = testapp(server.app)
        ret = app.post_json('/api/make_dir', {'username': 'folderx'})
        assert ret.json_body == {'result': 111}


def test_get_img_file(tmpdir):
    with tmpdir.as_cwd():
        imgdir = build_img_dir(tmpdir, 'folderx')
        imgdir.join('a.jpeg').write_binary(b'')
        imgdir.join('aierf_y832fa.jpg').write_binary(b'')
        imgdir.join('c-b.png').write_binary(b'')
        imgdir.join('37oiahfw*.jpeg').write_binary(b'')
        imgdir.join('aakhk.bmp').write_binary(b'')

        ret_names, ret_dup_names, ret_undef_names = server.get_userfolder_files('folderx')
        print("acceptable filename: {}".format(ret_names))
        print("illegal filename: {}".format(ret_undef_names))
        assert ret_names == ['a.jpeg', 'aakhk.bmp', 'aierf_y832fa.jpg']
        assert ret_undef_names == ['37oiahfw*.jpeg', 'c-b.png']
