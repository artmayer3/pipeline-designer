import { useState } from "react";
import { Stage, Layer, Circle, Line } from "react-konva";
import { Node, Pipe, Mode } from "../../utils";
import "./PipelineDesigner.css";

export const PipelineDesigner = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [mode, setMode] = useState<Mode>(Mode.Move);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const addNode = (position: { x: number; y: number }) => {
    const newNode = { x: position.x, y: position.y };
    setNodes([...nodes, newNode]);

    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const newPipe = {
        startX: lastNode.x,
        startY: lastNode.y,
        endX: newNode.x,
        endY: newNode.y,
      };
      setPipes([...pipes, newPipe]);
    }
  };

  const handleStageClick = (e: any) => {
    if (mode === Mode.Add) {
      const position = e.target.getStage().getPointerPosition();
      addNode(position);
    }
  };

  const handleAddNodeClick = () => {
    setMode(Mode.Add);
  };

  const handleRemoveNodeClick = () => {
    if (selectedNode !== null) {
      const newNodes = [...nodes];
      newNodes.splice(selectedNode, 1);

      const newPipes = [...pipes];
      newPipes.splice(selectedNode > 0 ? selectedNode - 1 : 0, 1);

      setNodes(newNodes);
      setPipes(newPipes);
    }

    setSelectedNode(null);
  };

  const updatePipes = (index: number) => {
    const updatedPipes = [...pipes];

    if (index > 0 || index < nodes.length - 1) {
      if (index > 0) {
        const { x: startX, y: startY } = nodes[index - 1];
        const { x: endX, y: endY } = nodes[index];
        updatedPipes[index - 1] = { startX, startY, endX, endY };
      }

      if (index < nodes.length - 1) {
        const { x: startX, y: startY } = nodes[index];
        const { x: endX, y: endY } = nodes[index + 1];
        updatedPipes[index] = { startX, startY, endX, endY };
      }

      setPipes(updatedPipes);
    }
  };

  return (
    <div>
      <div
        style={{
          backgroundColor: "white",
          border: "black",
          borderStyle: "groove",
        }}
      >
        <Stage
          width={window.innerWidth}
          height={window.innerHeight / 2}
          onClick={handleStageClick}
        >
          <Layer>
            {nodes.map((node, index) => (
              <Circle
                key={index}
                x={node.x}
                y={node.y}
                radius={10}
                fill="black"
                draggable
                onDragEnd={(e) => {
                  const newNodes = [...nodes];
                  newNodes[index] = {
                    x: e.target.x(),
                    y: e.target.y(),
                  };
                  setNodes(newNodes);
                }}
                onClick={(e) => {
                  if (index === 0 || index === nodes.length - 1) {
                    e.target.scale({ x: 1.5, y: 1.5 });
                    setSelectedNode(index);
                  }
                }}
                onMouseEnter={(e) => {
                  e.target.scale({ x: 1.5, y: 1.5 });
                }}
                onMouseOut={(e) => {
                  if (index !== selectedNode) {
                    e.target.scale({ x: 1, y: 1 });
                  }
                }}
                onDragMove={(e) => {
                  const newNodes = [...nodes];
                  newNodes[index] = {
                    x: e.target.x(),
                    y: e.target.y(),
                  };
                  setNodes(newNodes);
                  updatePipes(index);
                }}
              />
            ))}
            {pipes.map((pipe, index) => (
              <Line
                key={index}
                points={[pipe.startX, pipe.startY, pipe.endX, pipe.endY]}
                stroke="black"
                strokeWidth={3}
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <div>
        <div>
          {mode === Mode.Add ? (
            <button className="button" onClick={() => setMode(Mode.Move)}>
              Отменить
            </button>
          ) : (
            <button className="button" onClick={handleAddNodeClick}>
              Добавить узел
            </button>
          )}

          {nodes.length > 0 && selectedNode !== null ? (
            <button className="button" onClick={handleRemoveNodeClick}>
              Удалить узел
            </button>
          ) : (
            <button className="button" disabled>
              Удалить узел
            </button>
          )}
        </div>
        <div>
          <h3>Выбранный узел</h3>
          <ul>
            {selectedNode !== null ? <li>{selectedNode + 1}</li> : <li>Нет</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};
