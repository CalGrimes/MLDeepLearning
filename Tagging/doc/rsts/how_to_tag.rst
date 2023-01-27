How to tag
==========


ReNomTAG provides two tagging modes for creating labeled data. In Detection mode,
users can create bounding box information for object detection models. In Segmentation mode, users can create
pixel-level segmentation labels for semantic segmentation models. Each mode is described below.

To switch between the modes, click the mode you would like to use at the upper right.

.. image:: /_static/image/how_to_tag01.png
   :align: center

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Detection mode
-------------------

Create tags (bounding boxes)
~~~~~~~~~~~~~~~~~~~~~~~

You can create a tag (bounding box) by dragging the cursor inside the image.

.. image:: /_static/image/how_to_tag02.png
   :align: center

.. note::

    For saving the tag (a pair of bounding boxes and tag name), a ``class tag name`` is required.


Save tags
~~~~~~~~~~~~~~~~~~~~~

To save the tag, please click the ``save`` button.
The ``Space`` key also acts as a shortcut for saving.


Hide all unselected tags
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
You can choose to hide unselected boxes by clicking the ``toggle button``.
``Ctrl+d`` can also be used as a shortcut for this.
New boxes can still be added in this mode.
Return to the normal view by clicking the toggle button or using ``Ctrl+d`` again.

.. image:: /_static/image/how_to_tag03.png
   :align: center


Set shortcut keys for class tags
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You can set a shortcut key for each class tag name.


Default shortcut keys for faster tagging
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ReNomTAG provides the following default shortcuts for faster tagging.

- ``Ctrl+b`` : Copy all boxes from previous image and paste on current image.
- ``Ctrl+c, Ctrl+v`` : Copy currently selected box and paste on current image.
- ``Ctrl+z`` :  Undo previous change to box (shape, position, or class tag).


Full-screen tagging
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Tag in full-screen mode with the ``Ctrl+w`` or clicking the third icon at the bottom of the current image.
Return to normal mode by using the same shortcut or clicking the same icon.

.. image:: /_static/image/how_to_tag04.png
   :align: center


Expanding/shrinking images during tagging
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Expand or shrink the active image by using the trackpad or the ``+`` or ``-`` buttons in the toolbar at the bottom of the image.
Return to the original image size by clicking the second icon on the toolbar.

.. image:: /_static/image/how_to_tag05.png
   :align: center

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Segmentation mode
-------------------


Create segmentation labels
~~~~~~~~~~~~~~~~~~~~~~~

Segmentation labels are created as polygons with vertices defined at each location the user clicks.

Create a segmentation label by first clicking anywhere along the boundary of the object to be segmented.
The initial point is represented by a enlarged, hollow circle. Move around the border of the object and click at regular
intervals to create polygon vertices.

The vertices will be connected by straight lines.

After returning to the original point, click inside the hollow circle again to fill in the polygon.

.. image:: /_static/image/how_to_tag06.png
   :align: center

Then select a class label from the list at right to select the class of the area you just created.
The color of the polygon will change to reflect the class color.

.. image:: /_static/image/how_to_tag07.png
   :align: center

Click the image anywhere outside the active polygon area to exit editing mode. You can now save the label information.

.. image:: /_static/image/how_to_tag09.png
   :align: center

To edit an existing polygon, click once inside the polygon to enable editing. The polygon vertices will reappear for editing.

.. image:: /_static/image/how_to_tag08.png
   :align: center

.. note::

    For saving the label (polygon vertices and class name), a ``class tag name`` is required.


Save label
~~~~~~~~~~~~~~~~~~~~~

To save the label, please click the ``save`` button.
The ``Space`` key also acts as a shortcut for saving.


Set shortcut keys for class tags
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You can set a shortcut key for each class tag name.


Full-screen tagging
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Tag in full-screen mode with the ``Ctrl+w`` or clicking the third icon at the bottom of the current image.
Return to normal mode by using the same shortcut or clicking the same icon.

.. image:: /_static/image/how_to_tag04.png
   :align: center


Expanding/shrinking images during tagging
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Expand or shrink the active image by using the trackpad or the ``+`` or ``-`` buttons in the toolbar at the bottom of the image.
Return to the original image size by clicking the second icon on the toolbar.

.. image:: /_static/image/how_to_tag05.png
   :align: center
