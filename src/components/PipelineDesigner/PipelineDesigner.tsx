import { useCallback, useEffect, useState } from "react";
import { Stage, Layer, Circle, Line } from "react-konva";
import { Node, Pipe, Mode } from "../../utils";
import "./PipelineDesigner.css";

export const PipelineDesigner = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [mode, setMode] = useState<Mode>(Mode.Default);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [selectedEdgeNode, setSelectedEdgeNode] = useState<number | null>(null);

  const addNode = (position: { x: number; y: number }) => {
    const newNode = { x: position.x, y: position.y };
    setNodes((prevNodes) => [...prevNodes, newNode]);

    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const newPipe = {
        startX: lastNode.x,
        startY: lastNode.y,
        endX: newNode.x,
        endY: newNode.y,
      };
      setPipes((prevPipes) => [...prevPipes, newPipe]);
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
    if (selectedEdgeNode !== null) {
      setNodes((prevNodes) => {
        const newNodes = [...prevNodes];
        newNodes.splice(selectedEdgeNode, 1);
        return newNodes;
      });

      setPipes((prevPipes) => {
        const newPipes = [...prevPipes];
        newPipes.splice(selectedEdgeNode > 0 ? selectedEdgeNode - 1 : 0, 1);
        return newPipes;
      });
    }

    setSelectedEdgeNode(null);
  };

  const updatePipes = (index: number) => {
    if (index >= nodes.length) {
      return;
    }

    setPipes((prevPipes) => {
      const updatedPipes = [...prevPipes];

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
      }

      return updatedPipes;
    });
  };

  const handleDragEnd = useCallback(
    (e: any, index: number) => {
      const newNodes = [...nodes];
      newNodes[index] = {
        x: e.target.x(),
        y: e.target.y(),
      };

      setNodes(newNodes);
    },
    [nodes]
  );

  const handleDragMove = useCallback(
    (e: any, index: number) => {
      const newNodes = [...nodes];
      newNodes[index] = {
        x: e.target.x(),
        y: e.target.y(),
      };
      setNodes(newNodes);
    },
    [nodes]
  );

  useEffect(() => {
    updatePipes(selectedNode ?? 0);
  }, [nodes]);

  const handleNodeClick = (index: number) => {
    if (index === 0 || index === nodes.length - 1) {
      setSelectedEdgeNode(index);
    } else {
      alert("Узел не является начальным или конечным");
      selectedEdgeNode !== null && setSelectedEdgeNode(null);
    }
  };

  const handleNodeMouseEnter = useCallback((e: any, index: number) => {
    e.target.scale({ x: 1.5, y: 1.5 });
    setSelectedNode(index);
  }, []);

  const handleNodeMouseLeave = useCallback((e: any) => {
    e.target.scale({ x: 1, y: 1 });
  }, []);

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
                onDragEnd={(e) => handleDragEnd(e, index)}
                onDragMove={(e) => handleDragMove(e, index)}
                onClick={() => handleNodeClick(index)}
                onMouseEnter={(e) => handleNodeMouseEnter(e, index)}
                onMouseLeave={handleNodeMouseLeave}
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
            <button className="button" onClick={() => setMode(Mode.Default)}>
              Отменить
            </button>
          ) : (
            <button className="button" onClick={handleAddNodeClick}>
              Добавить узел
            </button>
          )}

          {nodes.length > 0 && selectedEdgeNode !== null ? (
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
          <h3>Выбранный крайний узел:</h3>
          <ul>
            {selectedEdgeNode !== null ? (
              <li>{selectedEdgeNode + 1}</li>
            ) : (
              <li>Нет</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
